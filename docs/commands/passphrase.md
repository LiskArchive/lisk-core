# `lisk-core passphrase`

Commands relating to Lisk Core passphrases.

- [`lisk-core passphrase:decrypt ENCRYPTEDPASSPHRASE`](#lisk-core-passphrasedecrypt-encryptedpassphrase)
- [`lisk-core passphrase:encrypt`](#lisk-core-passphraseencrypt)

## `lisk-core passphrase:decrypt ENCRYPTEDPASSPHRASE`

Decrypts your secret passphrase using the password which was provided at the time of encryption.

```
USAGE
  $ lisk-core passphrase:decrypt ENCRYPTEDPASSPHRASE

ARGUMENTS
  ENCRYPTEDPASSPHRASE  Encrypted passphrase to decrypt.

OPTIONS
  -w, --password=password  Specifies a source for your secret password. Command will prompt you for input if this option
                           is not set.
                           Examples:
                           - --password=pass:password123 (should only be used where security is not important)

EXAMPLE
  passphrase:decrypt
  "iterations=1000000&cipherText=9b1c60&iv=5c8843f52ed3c0f2aa0086b0&salt=2240b7f1aa9c899894e528cf5b600e9c&tag=23c0111213
  4317a63bcf3d41ea74e83b&version=1"
```

_See code: [dist/commands/passphrase/decrypt.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-debug.2/dist/commands/passphrase/decrypt.ts)_

## `lisk-core passphrase:encrypt`

Encrypts your secret passphrase under a password.

```
USAGE
  $ lisk-core passphrase:encrypt

OPTIONS
  -p, --passphrase=passphrase  Specifies a source for your secret passphrase. Command will prompt you for input if this
                               option is not set.
                               Examples:
                               - --passphrase='my secret passphrase' (should only be used where security is not
                               important)

  -w, --password=password      Specifies a source for your secret password. Command will prompt you for input if this
                               option is not set.
                               Examples:
                               - --password=pass:password123 (should only be used where security is not important)

  --outputPublicKey            Includes the public key in the output. This option is provided for the convenience of
                               node operators.

EXAMPLE
  passphrase:encrypt
```

_See code: [dist/commands/passphrase/encrypt.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-debug.2/dist/commands/passphrase/encrypt.ts)_
