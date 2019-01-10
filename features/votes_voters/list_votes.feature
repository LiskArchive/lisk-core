Feature: List Votes
  In order check votes I casted to delegates
  As a delegate
  I want to see list of votes that I have casted

  Scenario Outline: List votes with params
    When I request for votes with "<params>"
    Then I should get votes according to "<params>"

    Examples:
      | params                                                                     |
      | address=16313739661670634666L                                              |
      | username=genesis_1                                                         |
      | publicKey=c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f |
      | sort=balance:asc&address=16313739661670634666L                             |
      | sort=balance:desc&address=16313739661670634666L                            |

