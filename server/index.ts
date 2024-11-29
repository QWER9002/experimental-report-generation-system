import express from 'express'
import cors from 'cors'
import * as docx from 'docx'
import dotenv from 'dotenv'
import axios from 'axios'
import path from 'path'
import authRoutes from './routes/auth'
import reportRoutes from './routes/reports'

dotenv.config({ path: path.resolve(__dirname, '.env') })

const app = express()
app.use(cors())
app.use(express.json())

// 添加重试函数
async function retryOperation<T>(operation: () => Promise<T>, maxAttempts = 3): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      if (attempt === maxAttempts) throw error
      console.log(`第 ${attempt} 次尝试失败，等待重试...`)
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt))
    }
  }
  throw new Error('重试失败')
}

// 修改基本配置
const API_BASE_URL = 'https://api.moonshot.cn'
axios.defaults.timeout = 120000  // 增加到 120 秒

const KIMI_API_KEY = process.env.KIMI_API_KEY || 'sk-cfuxybnEUzrmEDSVOFFZp6k8y1Jf8bBdUj8mSFExqRPyKCbt'

if (!KIMI_API_KEY) {
  console.error('错误: KIMI_API_KEY 未设置。请确保在 server/.env 文件中设置了正确的 API key')
  process.exit(1)
}

console.log('API key 加载成功:', KIMI_API_KEY.substring(0, 10) + '...')

// 添加一个函数来处理文件名
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9-_\u4e00-\u9fa5]/g, '_')
    .replace(/_{2,}/g, '_')
}

app.use('/api/auth', authRoutes)
app.use('/api/reports', reportRoutes)

// 使用中间件
app.post('/api/generate-report', async (req, res) => {
  try {
    const { courseName, experimentTitle, purpose, steps } = req.body

    console.log('1. 开始处理请求...')
    console.log('使用的 API Key:', KIMI_API_KEY.substring(0, 10) + '...')

    const response = await retryOperation(() => 
      axios.post(
        'https://api.moonshot.cn/v1/chat/completions',
        {
          model: "moonshot-v1-8k",
          messages: [
            {
              role: "system",
              content: "你是一个专业的实验报告生成助手。请用中文回复。"
            },
            {
              role: "user",
              content: `生成一份实验报告，包含以下信息：
课程名称：${courseName}
实验题目：${experimentTitle}
实验目的：${purpose}
实验步骤：${steps}

请按照以下格式生成报告：

# ${experimentTitle}

## 一、实验目的
${purpose}

## 二、实验原理

## 三、实验器材

## 四、实验步骤
${steps}

## 五、实验结果分析

## 六、实验总结
`
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${KIMI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 120000
        }
      )
    )

    console.log('3. AI 响应成功:', {
      status: response.status,
      hasData: !!response.data
    })

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('AI 响应内容为空')
    }

    const reportContent = response.data.choices[0].message.content

    const doc = new docx.Document({
      sections: [{
        properties: {},
        children: [
          new docx.Paragraph({
            text: experimentTitle,
            heading: docx.HeadingLevel.HEADING_1,
            spacing: { after: 400 },
            alignment: docx.AlignmentType.CENTER
          }),
          ...reportContent.split('\n').map((p: string) => {
            if (p.startsWith('# ')) {
              return new docx.Paragraph({
                text: p.substring(2),
                heading: docx.HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 }
              })
            } else if (p.startsWith('## ')) {
              return new docx.Paragraph({
                text: p.substring(3),
                heading: docx.HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 200 }
              })
            } else {
              return new docx.Paragraph({
                text: p,
                spacing: { after: 200 }
              })
            }
          })
        ]
      }]
    })

    const buffer = await docx.Packer.toBuffer(doc)
    
    const safeFilename = sanitizeFilename(courseName)
    const contentDisposition = `attachment; filename="${safeFilename}-report.docx"; filename*=UTF-8''${encodeURIComponent(safeFilename)}-report.docx`
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    res.setHeader('Content-Disposition', contentDisposition)
    res.send(buffer)

  } catch (error: any) {
    console.error('请求失败:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    })
    
    let errorMessage = '请求失败'
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = '无法连接到服务器'
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      errorMessage = '请求超时，正在重试...'
    } else if (error.code === 'ERR_INVALID_CHAR') {
      errorMessage = '文件名包含不支持的字符'
    }

    res.status(500).json({
      error: errorMessage,
      details: {
        message: error.message,
        code: error.code,
        response: error.response?.data
      }
    })
  }
})

// 添加错误处理中间件
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err)
  res.status(500).json({
    error: '服务器错误',
    message: err.message
  })
})

// 添加 CORS 配置
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

// 添加健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(3000, () => {
  console.log('Server is running on port 3000')
  console.log('KIMI_API_KEY:', KIMI_API_KEY ? '已设置' : '未设置')
}) 