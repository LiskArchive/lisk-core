Feature: List Voters
  In order check votes that I have received
  As a delegate
  I want to see list of voters who have voted me

  Background: Client list
    Given I have list of clients

  Scenario Outline: List voters with params
    Given The network is moving
    When I request for voters with "<params>" and "<sort>" field
    Then I should get voters according to params

    Examples:
      | params          | values                                                 |
      | address         |                                                        |
      | username        |                                                        |
      | publicKey       |                                                        |
      | secondPublicKey |                                                        |
      | offset          |                                                        |
      | limit           |                                                        |
      | sort            | username:asc, username:desc, balance:asc, balance:desc |
