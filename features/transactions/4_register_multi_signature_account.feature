Feature: Register a multisignature account

  As a user or community
  I should be able to register for a multisignature account
  So that as user or community we can benefit from the authority over a single account

  Background: Client list
    Given I have list of clients

  Scenario: Register multisignature account for self
    Given I have a lisk account
    And I have minimum balance in my account for registering multisignature account
      """
      "fees": {
      "send": "10000000",
      "vote": "100000000",
      "secondSignature": "500000000",
      "delegate": "2500000000",
      "multisignature": "500000000",
      "dappRegistration": "2500000000",
      "dappWithdrawal": "10000000",
      "dappDeposit": "10000000"
      }
      """
    When I register for multisignature account with "my" public key
    Then I should have a multisignature account enabled with my public key


  Scenario: Register multisignature account minimum keys group
    Given I have a lisk account
    And I have minimum balance in my account for registering multisignature account
      """
      "fees": {
      "send": "10000000",
      "vote": "100000000",
      "secondSignature": "500000000",
      "delegate": "2500000000",
      "multisignature": "500000000",
      "dappRegistration": "2500000000",
      "dappWithdrawal": "10000000",
      "dappDeposit": "10000000"
      }
      """
    When I have a "minimum" users with whom I want to setup multisignature account
      | user    |
      | sheldon |
      | raj     |
      | lenard  |
      | howard  |
    Then I register for multisignature account with minimum "2" keys group
    When the user "sheldon", "raj", "lenard" and "howard" send the signature for confirmation
    Then the signature should be accepted
    And multisignature account should be created

  Scenario: Register multisignature account maximum keys group
    Given I have a lisk account
    And I have minimum balance in my account for registering multisignature account
      """
      "fees": {
      "send": "10000000",
      "vote": "100000000",
      "secondSignature": "500000000",
      "delegate": "2500000000",
      "multisignature": "500000000",
      "dappRegistration": "2500000000",
      "dappWithdrawal": "10000000",
      "dappDeposit": "10000000"
      }
      """
    When I have a "maximum" of "15" users with whom I want to setup multisignature account
    Then I register for multisignature account with maximum "15" keys group
    When all the "15" users send the signature for confirmation
    Then the signature should be accepted
    And multisignature account should be created

  Scenario: Transfer tokens using my multisignature account
    Given There is enough balance in "my" multisignature account
      """
      "fees": {
      "send": "10000000",
      "vote": "100000000",
      "secondSignature": "500000000",
      "delegate": "2500000000",
      "multisignature": "500000000",
      "dappRegistration": "2500000000",
      "dappWithdrawal": "10000000",
      "dappDeposit": "10000000"
      }
      """
    When I send tranfer transaction with "my" keys
    Then tokens should be sent to other account

  Scenario: Transfer tokens using minimum keys group multisignature account
    Given There is enough balance in "minimum" multisignature account
      """
      "fees": {
      "send": "10000000",
      "vote": "100000000",
      "secondSignature": "500000000",
      "delegate": "2500000000",
      "multisignature": "500000000",
      "dappRegistration": "2500000000",
      "dappWithdrawal": "10000000",
      "dappDeposit": "10000000"
      }
      """
    When I send tranfer transaction with "minimum" keys
    Then tokens should be sent to other account

  Scenario: Transfer tokens using maximum keys group multisignature account
    Given There is enough balance in "maximum" multisignature account
      """
      "fees": {
      "send": "10000000",
      "vote": "100000000",
      "secondSignature": "500000000",
      "delegate": "2500000000",
      "multisignature": "500000000",
      "dappRegistration": "2500000000",
      "dappWithdrawal": "10000000",
      "dappDeposit": "10000000"
      }
      """
    When I send tranfer transaction with "maximum" keys
    Then tokens should be sent to other account
