
Feature: Over spend from account

  I want to spend more LSK than what I have in my account

  Scenario: Over spend
    Given I have account A, B, X, Y, Z
    When I transfer 1LSK to account "A" and "B" from genesis account
    Then lisk account "A" and "B" should be created with balance 1LSK
    And I transfer 0.7LSK from account "A" to "X"
    And I transfer 0.5LSK from account "B" to "Y"
    And I transfer 0.3LSK from account "A" to "B"
    And I transfer 0.5LSK from account "B" to "Z"
    And I wait for a block
    Then I expect transfer 0.7LSK from A to X should be succeeded
    And I expect transfer 0.5LSK from B to Y should be succeeded
    And I expect transfer 0.3LSK from A to B should be failed
    And I expect transfer 0.5LSK from B to z should be failed

