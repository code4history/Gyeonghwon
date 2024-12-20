import { describe, it, expect } from 'vitest'
import Gyeonghwon from '../index'

describe('Gyeonghwon 基本機能テスト', () => {
  it('インスタンスが正しく生成されること', () => {
    const gh = new Gyeonghwon()
    expect(gh).toBeDefined()
    expect(gh).toBeInstanceOf(Gyeonghwon)
    expect(typeof gh.parseURL).toBe('function')
  })
})