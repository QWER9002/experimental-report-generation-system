<template>
  <div class="index-container">
    <header class="header">
      <h1>实验报告生成系统</h1>
      <div class="user-info">
        <span>欢迎, {{ username }}</span>
        <button @click="handleLogout" class="logout-btn">退出登录</button>
      </div>
    </header>
    <main class="main-content">
      <div class="sidebar">
        <nav class="nav-menu">
          <div class="menu-item active">首页</div>
       
        </nav>
      </div>
      <div class="content-area">
        <div class="welcome-section">
          <h2>欢迎使用实验报告生成系统</h2>
          <p>这里是系统主页，您可以开始您的工作了。</p>
        </div>
        
        <div class="content-area">
          <div class="welcome-section">
            <h2>实验报告生成</h2>
            <div class="report-form">
              <div class="form-group">
                <label>课程名称</label>
                <input v-model="reportData.courseName" type="text" placeholder="请输入课程名称">
              </div>
              <div class="form-group">
                <label>实验题目</label>
                <input v-model="reportData.experimentTitle" type="text" placeholder="请输入实验题目">
              </div>
              <div class="form-group">
                <label>实验目的</label>
                <textarea v-model="reportData.purpose" placeholder="请输入实验目的"></textarea>
              </div>
              <div class="form-group">
                <label>实验步骤</label>
                <textarea v-model="reportData.steps" placeholder="请输入实验步骤"></textarea>
              </div>
              <button @click="generateReport" :disabled="generating" class="generate-btn">
                {{ generating ? '生成中...' : '生成报告' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('管理员')
const generating = ref(false)
const reportData = reactive({
  courseName: '',
  experimentTitle: '',
  purpose: '',
  steps: ''
})

const handleLogout = () => {
  localStorage.removeItem('isLoggedIn')
  router.push('/login')
}

const generateReport = async () => {
  try {
    generating.value = true
    console.log('开始请求...')

    const response = await fetch('http://localhost:3000/api/generate-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reportData)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('服务器返回错误:', errorData)
      throw new Error(errorData.details?.message || errorData.error || '生成报告失败')
    }

    // 获取文件 blob
    const blob = await response.blob()
    if (blob.size === 0) {
      throw new Error('生成的文件为空')
    }

    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportData.courseName}-实验报告.docx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    // 显示成功消息
    alert('报告生成成功！')
    
  } catch (error) {
    console.error('请求失败:', error)
    if (error.name === 'AbortError') {
      alert('请求超时，请检查网络连接')
    } else {
      alert(error instanceof Error ? error.message : '生成报告失败，请重试')
    }
  } finally {
    generating.value = false
  }
}

onMounted(() => {
  // 这里可以添加初始化逻辑
})
</script>

<style scoped>
.index-container {
  min-height: 100vh;
  background-color: #f0f2f5;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: #fff;
  padding: 0 48px;
  height: 64px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
}

.main-content {
  display: flex;
  margin-top: 64px;
  flex: 1;
}

.sidebar {
  width: 256px;
  background-color: #fff;
  height: calc(100vh - 64px);
  position: fixed;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.nav-menu {
  padding: 16px 0;
}

.menu-item {
  padding: 16px 24px;
  cursor: pointer;
  font-size: 16px;
  color: #333;
  transition: all 0.3s;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-item.active {
  background-color: #e6f7ff;
  color: #1890ff;
  border-right: 3px solid #1890ff;
}

.content-area {
  margin-left: 256px;
  padding: 24px 48px;
  width: calc(100% - 256px);
}

.welcome-section {
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-top: 24px;
}

.dashboard-card {
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  text-align: center;
}

.dashboard-card h3 {
  color: #666;
  margin-bottom: 16px;
}

.dashboard-card .number {
  font-size: 36px;
  font-weight: bold;
  color: #1890ff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 24px;
}

.user-info span {
  font-size: 16px;
  color: #666;
}

.logout-btn {
  padding: 8px 16px;
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.logout-btn:hover {
  background-color: #ff7875;
}

h1 {
  margin: 0;
  color: #1890ff;
  font-size: 24px;
}

h2 {
  color: #333;
  margin-bottom: 16px;
  font-size: 20px;
}

.report-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  height: 120px;
  resize: vertical;
}

.generate-btn {
  background-color: #1890ff;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  width: 200px;
  margin: 20px auto;
  display: block;
}

.generate-btn:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}
</style> 