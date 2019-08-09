
Feature: Over spend from account

  I want to spend more LSK than what I have in my account

  Scenario: Transfer Transaction Scenario One
    Given I have account "A, B, X, Y, Z"
    Then I transfer 1LSK to account "A" from genesis account
    Then I transfer 1LSK to account "B" from genesis account
    Then I wait for transactions "A, B" to get confirmed in blockchain
    Then I wait for "1" blocks to make sure consicutive transactions included in one block
    Then I transfer "0.7"LSK from account "A" to "X"
    Then I transfer "0.6"LSK from account "B" to "Y"
    Then I transfer "0.3"LSK from account "A" to "B"
    Then I transfer "0.5"LSK from account "B" to "Z"
    Then I expect transfer "0.7"LSK from "A" to "X" should succeeded
    Then I expect transfer "0.6"LSK from "B" to "Y" should succeeded
    Then I expect transfer "0.3"LSK from "A" to "B" should fail
    Then I expect transfer "0.5"LSK from "B" to "Z" should fail

  Scenario: Transfer Transaction Scenario Two
    Given I have account "C, D, E, F"
    Then I transfer 1LSK to account "C" from genesis account
    Then I transfer 1LSK to account "D" from genesis account
    Then I wait for transactions "C, D" to get confirmed in blockchain
    Then I wait for "1" blocks to make sure consicutive transactions included in one block
    Then I transfer "0.6"LSK from account "C" to "E"
    Then I transfer "0.4"LSK from account "C" to "F"
    Then I transfer "0.3"LSK from account "D" to "C"
    Then I expect transfer "0.6"LSK from "C" to "E" should succeeded
    Then I expect transfer "0.4"LSK from "C" to "F" should fail
    Then I expect transfer "0.3"LSK from "D" to "C" should succeeded

  # Scenario: Transfer and register second signature in one block
  #   Given I have account "SPP"
  #   Then I transfer 6LSK to account "SPP" from genesis account
  #   Then I wait for transactions "SPP" to get confirmed in blockchain
  #   Then I wait for "1" blocks to make sure consicutive transactions included in one block
  #   Then I transfer "0.01"LSK from second signature account "SPP" to "SPP"
  #   Then I register second passphrase on account "SPP"
  #   Then I expect transfer "0.01"LSK from "SPP" to "SPP" should succeeded
