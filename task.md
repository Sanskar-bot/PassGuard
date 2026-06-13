# VaultZero — Day 2 Completion + Day 3 Implementation

## Day 2 — Finish Crypto Core
- [x] Add `encryptVault()` and `decryptVault()` to bridge vault CRUD ↔ AES-GCM
- [x] Update vault barrel exports

## Day 3 — Vault Operations + Recovery Phrase
- [ ] Create `recovery/wordlist.ts` with BIP39 2048-word English list
- [ ] Implement `generateRecoveryPhrase()` — 24 random words
- [ ] Implement `hashRecoveryPhrase(phrase)` — SHA-256 hex digest
- [ ] Implement `deriveRecoveryKEK(phrase, salt)` — Argon2id with phrase as password
- [ ] Update recovery barrel exports
- [ ] Write vault serialization tests (encrypt/decrypt round-trip, wrong key rejection)
- [ ] Write recovery phrase tests (length, uniqueness, hash determinism, KEK derivation)
- [ ] Run full test suite — all tests pass
