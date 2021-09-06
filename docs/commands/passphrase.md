# `lisk-core passphrase`

Commands relating to Lisk Core passphrases.

- [`lisk-core passphrase:decrypt ENCRYPTEDPASSPHRASE`](#lisk-core-passphrasedecrypt-encryptedpassphrase)
- [`lisk-core passphrase:encrypt`](#lisk-core-passphraseencrypt)

## `lisk-core passphrase:decrypt ENCRYPTEDPASSPHRASE`

Decrypt secret passphrase using the password provided at the time of encryption.

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

  --pretty                 Prints JSON in pretty format rather than condensed.

EXAMPLES
  passphrase:decrypt
  "iterations=1000000&cipherText=9b1c60&iv=5c8843f52ed3c0f2aa0086b0&salt=2240b7f1aa9c899894e528cf5b600e9c&tag=23c0111213
  4317a63bcf3d41ea74e83b&version=1"
  passphrase:decrypt
  "iterations=1000000&cipherText=9b1c60&iv=5c8843f52ed3c0f2aa0086b0&salt=2240b7f1aa9c899894e528cf5b600e9c&tag=23c0111213
  4317a63bcf3d41ea74e83b&version=1" --password your-password
```

_See code: [dist/commands/passphrase/decrypt.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0/dist/commands/passphrase/decrypt.ts)_

## `lisk-core passphrase:encrypt`

Encrypt secret passphrase using password.

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

  --output-public-key          Includes the public key in the output. This option is provided for the convenience of
                               node operators.

  --pretty                     Prints JSON in pretty format rather than condensed.

EXAMPLES
  passphrase:encrypt
  passphrase:encrypt --passphrase your-passphrase
  passphrase:encrypt --password your-password
  passphrase:encrypt --password your-password --passphrase your-passphrase --pretty
  passphrase:encrypt --output-public-key
```

_See code: [dist/commands/passphrase/encrypt.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0/dist/commands/passphrase/encrypt.ts)_
