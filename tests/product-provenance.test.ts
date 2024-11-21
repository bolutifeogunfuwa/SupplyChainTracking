import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'

const contractSource = readFileSync('./contracts/product-provenance.clar', 'utf8')

describe('Product Provenance Contract', () => {
  it('should define contract-owner constant', () => {
    expect(contractSource).toContain('(define-constant contract-owner tx-sender)')
  })
  
  it('should define error constants', () => {
    expect(contractSource).toContain('(define-constant err-owner-only (err u100))')
    expect(contractSource).toContain('(define-constant err-not-found (err u101))')
    expect(contractSource).toContain('(define-constant err-unauthorized (err u102))')
  })
  
  it('should define next-product-id data variable', () => {
    expect(contractSource).toContain('(define-data-var next-product-id uint u1)')
  })
  
  it('should define products map', () => {
    expect(contractSource).toContain('(define-map products uint {')
    expect(contractSource).toContain('name: (string-ascii 50),')
    expect(contractSource).toContain('manufacturer: principal,')
    expect(contractSource).toContain('current-owner: principal')
  })
  
  it('should define product-history map', () => {
    expect(contractSource).toContain('(define-map product-history uint (list 20 {')
    expect(contractSource).toContain('owner: principal,')
    expect(contractSource).toContain('timestamp: uint')
  })
  
  it('should have a register-product function', () => {
    expect(contractSource).toContain('(define-public (register-product (name (string-ascii 50)))')
  })
  
  it('should set product details in register-product function', () => {
    expect(contractSource).toContain('(map-set products new-id {')
    expect(contractSource).toContain('name: name,')
    expect(contractSource).toContain('manufacturer: manufacturer,')
    expect(contractSource).toContain('current-owner: manufacturer')
  })
  
  it('should have a transfer-product function', () => {
    expect(contractSource).toContain('(define-public (transfer-product (product-id uint) (new-owner principal))')
  })
  
  it('should check for product ownership in transfer-product function', () => {
    expect(contractSource).toContain('(asserts! (is-eq (get current-owner product) tx-sender) err-unauthorized)')
  })
  
  it('should update product ownership in transfer-product function', () => {
    expect(contractSource).toContain('(map-set products product-id (merge product { current-owner: new-owner }))')
  })
  
  it('should have a get-product read-only function', () => {
    expect(contractSource).toContain('(define-read-only (get-product (product-id uint))')
  })
  
  it('should have a get-product-history read-only function', () => {
    expect(contractSource).toContain('(define-read-only (get-product-history (product-id uint))')
  })
})

