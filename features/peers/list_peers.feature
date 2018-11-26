Feature: List Peers
  In order to join the network
  As a user
  I want to see list of available peers in the network

  Background: Client list
    Given I have list of clients

  Scenario: List peers without params
    Given The network is moving
    When I request for peers without any params
    Then I should get list of "10" peers

  Scenario Outline: List peers with params
    Given The network is moving
    When I request for blocks with "<params>" and "<sort>" field
    Then I should get blocks according to params

    Examples:
      | params    | values                                             |
      | ip        |                                                    |
      | httpPort  |                                                    |
      | wsPort    |                                                    |
      | os        |                                                    |
      | version   |                                                    |
      | state     |                                                    |
      | height    |                                                    |
      | broadhash |                                                    |
      | limit     |                                                    |
      | offset    |                                                    |
      | sort      | height:asc, height:desc, version:asc, version:desc |
