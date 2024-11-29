import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = Router()

router.post('/register', async (req: any, res: any) => {
  // 处理注册逻辑
})

router.post('/login', async (req: any, res: any) => {
  // 处理登录逻辑
})

export default router 