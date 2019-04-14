Feature: Register dApp

  As a user
  I want to register dApp
  So that I can conduct ICO on lisk

  Scenario: dApp registration
    Given "thor" has a lisk account with balance 100 LSK tokens
    When "thor" register for dApp "coral reef ICO"
    Then dApp "coral reef ICO" should be registered

  Scenario: dApp registration from second signature account
    Given "loki" has a lisk account with balance 100 LSK tokens
    Given "loki" has a account with second signature
    When "loki" uses second signature account to register for dApp "save tiger ICO"
    Then dApp "save tiger ICO" should be registered

  Scenario: dApp registration from multisignature account
    Given "heimdall" has a lisk account with balance 100 LSK tokens
    Given "odin" has a lisk account with balance 100 LSK tokens
    Given "heimdall" creates a multisignature account with "thor", "odin"
    When "heimdall" uses multi signature account to register for dApp "smart grid ICO"
    When "thor", "odin" send signatures for dApp "smart grid ICO"
    Then dApp "smart grid ICO" should be registered

