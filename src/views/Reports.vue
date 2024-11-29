<template>
  <div class="reports-container">
    <header class="header">
      <h1>实验报告历史</h1>
      <div class="user-info">
        <span>欢迎, {{ username }}</span>
        <button @click="handleLogout" class="logout-btn">退出登录</button>
      </div>
    </header>
    <main class="main-content">
      <div class="sidebar">
        <nav class="nav-menu">
          <router-link to="/index" class="menu-item">生成报告</router-link>
          <router-link to="/reports" class="menu-item active">历史报告</router-link>
        </nav>
      </div>
      <div class="content-area">
        <div class="reports-list">
          <div v-if="loading" class="loading">加载中...</div>
          <div v-else-if="reports.length === 0" class="empty">
            暂无历史报告
          </div>
          <div v-else class="report-items">
            <div v-for="report in reports" :key="report.id" class="report-item">
              <div class="report-info">
                <h3>{{ report.experimentTitle }}</h3>
                <p class="course-name">课程：{{ report.courseName }}</p>
                <p class="create-time">
                  创建时间：{{ new Date(report.createdAt).toLocaleString() }}
                </p>
              </div>
              <div class="report-actions">
                <button @click="viewReport(report)" class="view-btn">
                  查看报告
                </button>
                <button @click="downloadReport(report)" class="download-btn">
                  下载报告
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('用户')
const loading = ref(true)
const reports = ref<any[]>([])

const fetchReports = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const response = await fetch('http://localhost:3000/api/reports', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('获取报告失败')
    }

    reports.value = await response.json()
  } catch (error) {
    console.error('获取报告失败:', error)
    alert('获取报告失败')
  } finally {
    loading.value = false
  }
}

const viewReport = (report: any) => {
  // 这里可以添加查看报告的逻辑
  console.log('查看报告:', report)
}

const downloadReport = async (report: any) => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:3000/api/reports/${report.id}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('下载失败')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.courseName}-实验报告.docx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('下载失败:', error)
    alert('下载失败')
  }
}

const handleLogout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}

onMounted(() => {
  fetchReports()
})
</script>

<style scoped>
.reports-container {
  min-height: 100vh;
  background-color: #f0f2f5;
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
  min-height: calc(100vh - 64px);
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
  display: block;
  padding: 16px 24px;
  color: #333;
  text-decoration: none;
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

.reports-list {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.loading, .empty {
  text-align: center;
  padding: 48px;
  color: #666;
}

.report-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.report-item:last-child {
  border-bottom: none;
}

.report-info h3 {
  margin: 0 0 8px;
  color: #333;
}

.course-name, .create-time {
  color: #666;
  margin: 4px 0;
}

.report-actions {
  display: flex;
  gap: 8px;
}

.view-btn, .download-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.view-btn {
  background-color: #1890ff;
  color: white;
}

.download-btn {
  background-color: #52c41a;
  color: white;
}

.view-btn:hover {
  background-color: #40a9ff;
}

.download-btn:hover {
  background-color: #73d13d;
}

.logout-btn {
  padding: 8px 16px;
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.logout-btn:hover {
  background-color: #ff7875;
}
</style> 