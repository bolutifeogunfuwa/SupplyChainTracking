;; contracts/quality-assurance.clar

;; Define constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

;; Define maps
(define-map quality-checkpoints uint (list 10 {
  inspector: principal,
  timestamp: uint,
  status: (string-ascii 20),
  notes: (string-ascii 200)
}))

(define-map authorized-inspectors principal bool)

;; Private functions
(define-private (is-owner)
  (is-eq tx-sender contract-owner))

;; Public functions

;; Add authorized inspector
(define-public (add-authorized-inspector (inspector principal))
  (begin
    (asserts! (is-owner) err-owner-only)
    (ok (map-set authorized-inspectors inspector true))))

;; Remove authorized inspector
(define-public (remove-authorized-inspector (inspector principal))
  (begin
    (asserts! (is-owner) err-owner-only)
    (ok (map-delete authorized-inspectors inspector))))

;; Add quality checkpoint
(define-public (add-quality-checkpoint (product-id uint) (status (string-ascii 20)) (notes (string-ascii 200)))
  (let
    (
      (checkpoints (default-to (list) (map-get? quality-checkpoints product-id)))
      (inspector tx-sender)
    )
    (asserts! (default-to false (map-get? authorized-inspectors inspector)) err-unauthorized)
    (ok (map-set quality-checkpoints product-id
      (unwrap-panic (as-max-len? (concat checkpoints (list {
        inspector: inspector,
        timestamp: block-height,
        status: status,
        notes: notes
      })) u10))))
  )
)

;; Read-only functions

(define-read-only (get-quality-checkpoints (product-id uint))
  (map-get? quality-checkpoints product-id))

(define-read-only (is-authorized-inspector (inspector principal))
  (default-to false (map-get? authorized-inspectors inspector)))
