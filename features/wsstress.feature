
@edusocket
Feature: Websocket stress test

  Background:
    Given I visiting edualpha app with url "https://api-dev.edualpha.jp"
    Then I login with user "1801gv@gmail.com" and password "masYGB39"
    Then I start listen messages on socket server "https://socket-dev.edualpha.jp" with user 1000
    Then I listen for socket event "create-object"
    Then I listen for socket event "select-object"
    Then I listen for socket event "modify-object"
    Then I listen for socket event "remove-object"
    Then I visit slide 22034 on board board 968

  @WithTime
  @WS_SCN_1
  Scenario: I can create and remove object
    When I create a object with "create-object.json" and id "<PID>-ws-scn-01"
    Then I receive 1 "create-object" message[s] with socket within 10 seconds

    Then I wait for 2 seconds 

    # remove object
    When I delete objects ids "<PID>-ws-scn-01"
    Then I receive 1 "remove-object" message[s] with socket within 10 seconds

  @WithTime
  @WS_SCN_2
  Scenario: I can select and unselect object
    When I create a object with "create-object.json" and id "<PID>-ws-scn-02"
    Then I receive 1 "create-object" message[s] with socket within 10 seconds

    When I select objects "<PID>-ws-scn-02"
    Then I receive 1 "select-object" message[s] with socket within 10 seconds

    Then I wait for 2 seconds 

    When I unselect objects "<PID>-ws-scn-02"
    Then I receive 1 "select-object" message[s] with socket within 10 seconds

    # remove object
    When I delete objects ids "<PID>-ws-scn-02"
    Then I receive 1 "remove-object" message[s] with socket within 10 seconds

  @WithTime
  @WS_SCN_3
  Scenario: I can update object position
    When I create a object with "create-object.json" and id "<PID>-ws-scn-03"
    Then I receive 1 "create-object" message[s] with socket within 10 seconds

    Then I wait for 2 seconds 

    When I update object "<PID>-ws-scn-03" with "update-object-position.json" <UPDATE_AMOUNT> times
    Then I receive <UPDATE_AMOUNT> "modify-object" message[s] with socket

    # remove object
    When I delete objects ids "<PID>-ws-scn-03"
    Then I receive 1 "remove-object" message[s] with socket within 10 seconds
    Examples:
      | UPDATE_AMOUNT |
      | 5             |
      | 10            |
      | 20            |
      | 40            |

  @WithTime
  @WS_SCN_4
  Scenario: I can update object positions with acceptable amount of time!!!
    When I create a object with "create-object.json" and id "<PID>-ws-scn-04"
    Then I receive 1 "create-object" message[s] with socket within 10 seconds

    Then I wait for 2 seconds 

    When I update object "<PID>-ws-scn-04" with "update-object-position.json" 20 times within 10 seconds
    Then I receive 20 "modify-object" message[s] with socket

    # remove object
    When I delete objects ids "<PID>-ws-scn-04"
    Then I receive 1 "remove-object" message[s] with socket within 10 seconds

