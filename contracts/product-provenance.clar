;; contracts/product-provenance.clar

;; Define constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

;; Define data variables
(define-data-var next-product-id uint u1)

;; Define maps
(define-map products uint {
  name: (string-ascii 50),
  manufacturer: principal,
  creation-time: uint,
  current-owner: principal
})

(define-map product-history uint (list 20 {
  owner: principal,
  timestamp: uint,
  location: (string-ascii 100)
}))

;; Private functions
(define-private (is-owner)
  (is-eq tx-sender contract-owner))

;; Public functions

;; Register a new product
(define-public (register-product (name (string-ascii 50)) (location (string-ascii 100)))
  (let
    (
      (new-id (var-get next-product-id))
      (manufacturer tx-sender)
    )
    (map-set products new-id {
      name: name,
      manufacturer: manufacturer,
      creation-time: block-height,
      current-owner: manufacturer
    })
    (map-set product-history new-id (list {
      owner: manufacturer,
      timestamp: block-height,
      location: location
    }))
    (var-set next-product-id (+ new-id u1))
    (ok new-id)
  )
)

;; Transfer product ownership
(define-public (transfer-product (product-id uint) (new-owner principal) (location (string-ascii 100)))
  (let
    (
      (product (unwrap! (map-get? products product-id) err-not-found))
      (history (unwrap! (map-get? product-history product-id) err-not-found))
    )
    (asserts! (is-eq (get current-owner product) tx-sender) err-unauthorized)
    (map-set products product-id (merge product { current-owner: new-owner }))
    (map-set product-history product-id (unwrap-panic (as-max-len? (concat history (list {
      owner: new-owner,
      timestamp: block-height,
      location: location
    })) u20)))
    (ok true)
  )
)

;; Read-only functions

(define-read-only (get-product (product-id uint))
  (map-get? products product-id))

(define-read-only (get-product-history (product-id uint))
  (map-get? product-history product-id))
