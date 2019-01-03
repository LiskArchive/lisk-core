Feature: List Peers
  In order to join the network
  As a user
  I want to see list of available peers in the network

  Scenario: List peers without params
    When I request for peers without any params
    Then I should get list of peers
    And Peers should be sorted by "height" in "desc" order by default

  Scenario Outline: List peers with params
    When I request for peers with "<params>"
    Then I should get list of peers according to "<params>"

    Examples:
      | params            |
      | httpPort=4000     |
      | wsPort=5000       |
      | os=linux          |
      | state=2           |
      | sort=height:asc   |
      | sort=height:desc  |
      | sort=version:asc  |
      | sort=version:desc |
