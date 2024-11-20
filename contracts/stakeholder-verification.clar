;; contracts/stakeholder-verification.clar

;; Define constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-already-verified (err u103))

;; Define maps
(define-map stakeholders principal {
  name: (string-ascii 50),
  role: (string-ascii 20),
  verified: bool
})

(define-map verifiers principal bool)

;; Private functions
(define-private (is-owner)
  (is-eq tx-sender contract-owner))

;; Public functions

;; Add verifier
(define-public (add-verifier (verifier principal))
  (begin
    (asserts! (is-owner) err-owner-only)
    (ok (map-set verifiers verifier true))))

;; Remove verifier
(define-public (remove-verifier (verifier principal))
  (begin
    (asserts! (is-owner) err-owner-only)
    (ok (map-delete verifiers verifier))))

;; Register stakeholder
(define-public (register-stakeholder (name (string-ascii 50)) (role (string-ascii 20)))
  (ok (map-set stakeholders tx-sender {
    name: name,
    role: role,
    verified: false
  })))

;; Verify stakeholder
(define-public (verify-stakeholder (stakeholder principal))
  (let
    (
      (verifier tx-sender)
      (stakeholder-info (unwrap! (map-get? stakeholders stakeholder) err-not-found))
    )
    (asserts! (default-to false (map-get? verifiers verifier)) err-unauthorized)
    (asserts! (not (get verified stakeholder-info)) err-already-verified)
    (ok (map-set stakeholders stakeholder (merge stakeholder-info { verified: true })))
  )
)

;; Read-only functions

(define-read-only (get-stakeholder (stakeholder principal))
  (map-get? stakeholders stakeholder))

(define-read-only (is-verifier (verifier principal))
  (default-to false (map-get? verifiers verifier)))
