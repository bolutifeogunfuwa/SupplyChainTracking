;; Define constants
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

;; Public functions

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

