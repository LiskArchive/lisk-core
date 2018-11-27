Feature: List Peers
  In order to join the network
  As a user
  I want to see list of available peers in the network

  Background: Client list
    Given I have list of clients

  Scenario: List peers without params
    Given The network is moving
    When I request for peers without any params
    Then I should get list of "<10>" peers
    And Peers should be sorted by "<height>" in "<descending>" order by default

  Scenario Outline: List peers with params
    Given The network is moving
    When I request for peers with "<params>"
    Then I should get list of all the peers

    Examples:
      | params                                                  |
      | ip                                                      |
      | httpPort                                                |
      | wsPort                                                  |
      | os                                                      |
      | version                                                 |
      | state                                                   |
      | height                                                  |
      | broadhash                                               |
      | limit                                                   |
      | offset                                                  |
      | sort=height:asc, height:desc, version:asc, version:desc |
