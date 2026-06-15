# 📝 Changelog

All notable changes to the Password Strength Analyzer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Context-Aware Password Generator in the browser extension.
- 6 slot-order templates for generating highly personalized passwords.
- Real-time inline widget injection for `<input type="password">` fields.
- Web Worker implementation for generating personalized attack dictionaries.
- Cross-domain password reuse detection and storage.

### Changed
- Overhauled `generatorValidator.js` to allow safe integration of profile anchors (`hasNakedSimplePattern` replacing `hasDirectProfileExposure`).
- Updated the dictionary engine to support Trie-based substring scanning.
- Refactored `strength.js` to support dynamic character set detection.

### Fixed
- Fixed sequential pattern detection false positives in `patterns.js`.
- Fixed UI panel focus issues in the extension's Shadow DOM implementation.

---

## [1.0.0] - 2024-05-01

### Added
- Initial release of the Password Strength Analyzer web application.
- Entropy math module.
- Top 500 passwords hash-set detection.
- Keyboard walk and repeat detection.
- Zero-dependency Node.js static server.
- Basic cryptographically secure password generator.
