Feature: Register dApp

  As a user
  I want to register dApp
  So that I can conduct ICO on lisk

  Background: Client list
    Given I have list of clients

  Scenario: dApp registration
    Given I have a lisk account
    And I have minimum balance in my account for transaction "<dappRegistration>"
      """
      "fees": {
      "send": "10000000",
      "vote": "100000000",
      "secondSignature": "500000000",
      "delegate": "2500000000",
      "multisignature": "500000000",
      "dappRegistration": "2500000000"
      }
      """
    When I register for dApp "coral reef ICO" from my account
    Then dApp "coral reef ICO" should be registered

  Scenario: dApp registration from second signature account
    Given I have a account with second signature enabled
    And I have minimum balance in my account for transaction "<dappRegistration>"
      """
      "fees": {
      "send": "10000000",
      "vote": "100000000",
      "secondSignature": "500000000",
      "delegate": "2500000000",
      "multisignature": "500000000",
      "dappRegistration": "2500000000"
      }
      """
    When I register for dApp "save tiger ICO" from my account
    Then dApp "save tiger ICO" should be registered

  Scenario: dApp registration from multisignature account
    Given I have a multisignature account
    And I have minimum balance in my account for transaction "<dappRegistration>"
      """
      "fees": {
      "send": "10000000",
      "vote": "100000000",
      "secondSignature": "500000000",
      "delegate": "2500000000",
      "multisignature": "500000000",
      "dappRegistration": "2500000000"
      }
      """
    When I register for dApp "smart grid ICO" from my account
    Then dApp "smart grid ICO" should be registered

