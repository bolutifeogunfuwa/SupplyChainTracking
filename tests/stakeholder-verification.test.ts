import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'

const contractSource = readFileSync('./contracts/stakeholder-verification.clar', 'utf8')

describe('Stakeholder Verification Contract', () => {
  it('should define error constants', () => {
    expect(contractSource).toContain('(define-constant err-not-found (err u101))')
    expect(contractSource).toContain('(define-constant err-unauthorized (err u102))')
    expect(contractSource).toContain('(define-constant err-already-verified (err u103))')
  })
  
  it('should define stakeholders map', () => {
    expect(contractSource).toContain('(define-map stakeholders principal {')
    expect(contractSource).toContain('name: (string-ascii 50),')
    expect(contractSource).toContain('role: (string-ascii 20),')
    expect(contractSource).toContain('verified: bool')
  })
  
  it('should define verifiers map', () => {
    expect(contractSource).toContain('(define-map verifiers principal bool)')
  })
  
  it('should have a register-stakeholder function', () => {
    expect(contractSource).toContain('(define-public (register-stakeholder (name (string-ascii 50)) (role (string-ascii 20)))')
  })
  
  it('should set stakeholder as unverified in register-stakeholder function', () => {
    expect(contractSource).toContain('verified: false')
  })
  
  it('should have a verify-stakeholder function', () => {
    expect(contractSource).toContain('(define-public (verify-stakeholder (stakeholder principal))')
  })
  
  it('should check verifier authorization in verify-stakeholder function', () => {
    expect(contractSource).toContain('(asserts! (default-to false (map-get? verifiers verifier)) err-unauthorized)')
  })
  
  it('should check if stakeholder is already verified in verify-stakeholder function', () => {
    expect(contractSource).toContain('(asserts! (not (get verified stakeholder-info)) err-already-verified)')
  })
  
  it('should set stakeholder as verified in verify-stakeholder function', () => {
    expect(contractSource).toContain('(ok (map-set stakeholders stakeholder (merge stakeholder-info { verified: true })))')
  })
  
  it('should have a get-stakeholder read-only function', () => {
    expect(contractSource).toContain('(define-read-only (get-stakeholder (stakeholder principal))')
  })
  
  it('should have an is-verifier read-only function', () => {
    expect(contractSource).toContain('(define-read-only (is-verifier (verifier principal))')
  })
})

