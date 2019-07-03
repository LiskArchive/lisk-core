
Feature: Over spend from account

  I want to spend more LSK than what I have in my account

  Scenario: Over spend
    Given I have account A, B, X, Y, Z
    When I transfer 1LSK to account "A" and "B" from genesis account
    Then lisk account "A" and "B" should be created with balance 1LSK
    Then I transfer "0.7"LSK from account "A" to "X"
    Then I transfer "0.5"LSK from account "B" to "Y"
    Then I transfer "0.3"LSK from account "A" to "B"
    Then I transfer "0.5"LSK from account "B" to "Z"
    Then I wait for a block
    Then I expect transfer "0.7"LSK from A to X should be succeeded
    Then I expect transfer "0.5"LSK from B to Y should be succeeded
    Then I expect transfer "0.3"LSK from A to B should fail
    Then I expect transfer "0.5"LSK from B to z should fail

