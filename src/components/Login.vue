<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-left">
        <h1>实验报告生成系统</h1>
        <p class="subtitle">高效、便捷的实验报告管理平台</p>
      </div>
      <div class="login-right">
        <form @submit.prevent="handleLogin" class="login-form">
          <h2>用户登录</h2>
          <div class="form-item">
            <label>用户名</label>
            <input
              type="text"
              v-model="username"
              placeholder="请输入用户名"
              required
            />
          </div>
          <div class="form-item">
            <label>密码</label>
            <input
              type="password"
              v-model="password"
              placeholder="请输入密码"
              required
            />
          </div>
          <div class="form-options">
            <label>
              <input type="checkbox"> 记住密码
            </label>
            <a href="#">忘记密码？</a>
          </div>
          <button type="submit">登 录</button>
        </form>
      </div>
    </div>
    <div class="form-footer">
      <router-link to="/register">还没有账号？去注册</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const router = useRouter()

const handleLogin = async () => {
  console.log('Login attempt with:', username.value, password.value)
  
  // 测试账号
  if (username.value === 'admin' && password.value === 'admin123') {
    console.log('Login successful')
    localStorage.setItem('token', 'test-token')
    router.push('/index')
  } else {
    alert('用户名或密码错误')
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1890ff 0%, #1d39c4 100%);
}

.login-box {
  display: flex;
  width: 1000px;
  height: 600px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #1890ff 0%, #1d39c4 100%);
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: white;
}

.login-left h1 {
  font-size: 36px;
  margin-bottom: 24px;
  color: white;
}

.subtitle {
  font-size: 18px;
  opacity: 0.8;
}

.login-right {
  flex: 1;
  padding: 48px;
  display: flex;
  align-items: center;
}

.login-form {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.login-form h2 {
  font-size: 28px;
  color: #333;
  margin-bottom: 40px;
  text-align: center;
}

.form-item {
  margin-bottom: 24px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
}

input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  outline: none;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  color: #666;
  font-size: 14px;
}

.form-options a {
  color: #1890ff;
  text-decoration: none;
}

.form-options a:hover {
  color: #40a9ff;
}

button {
  width: 100%;
  padding: 12px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

button:hover {
  background-color: #40a9ff;
}
</style> 