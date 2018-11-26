Feature: List Votes
  In order check votes I casted to delegates
  As a delegate
  I want to see list of votes that I have casted

  Background: Client list
    Given I have list of clients

  Scenario Outline: List votes with params
    Given The network is moving
    When I request for votes with "<params>" and "<sort>" field
    Then I should get votes according to params

    Examples:
      | params          | values                                                 |
      | address         |                                                        |
      | username        |                                                        |
      | publicKey       |                                                        |
      | secondPublicKey |                                                        |
      | offset          |                                                        |
      | limit           |                                                        |
      | sort            | username:asc, username:desc, balance:asc, balance:desc |

