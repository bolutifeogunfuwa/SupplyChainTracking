;; Define constants
(define-constant err-unauthorized (err u102))

;; Define maps
(define-map quality-checkpoints uint (list 5 {
  inspector: principal,
  timestamp: uint,
  status: (string-ascii 20)
}))

(define-map authorized-inspectors principal bool)

;; Public functions

;; Add authorized inspector
(define-public (add-authorized-inspector (inspector principal))
  (ok (map-set authorized-inspectors inspector true)))

;; Add quality checkpoint
(define-public (add-quality-checkpoint (product-id uint) (status (string-ascii 20)))
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
        status: status
      })) u5))))
  )
)

;; Read-only functions

(define-read-only (get-quality-checkpoints (product-id uint))
  (map-get? quality-checkpoints product-id))

(define-read-only (is-authorized-inspector (inspector principal))
  (default-to false (map-get? authorized-inspectors inspector)))

