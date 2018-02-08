import Zap from "../zap";

it("works", () => {
  const tests = [
    {
      string: '["Cats","Dogs", "Snakes"]',
      expected: ["Cats", "Dogs", "Snakes"],
      type: "object"
    },
    {
      string: "['Cats','Dogs','Snakes']",
      expected: ["Cats", "Dogs", "Snakes"],
      type: "object"
    },
    {
      string: '{key1: "attribute1", key2: "attribute2"}',
      expected: { key1: "attribute1", key2: "attribute2" },
      type: "object"
    },
    {
      string: '{format:"recgWimTyjTH3S2or", timestamp:  "2017-08-12T20:52:52"}',
      expected: {
        format: "recgWimTyjTH3S2or",
        timestamp: "2017-08-12T20:52:52"
      },
      type: "object"
    },
    {
      string: "Cats,Dogs,Snakes",
      expected: ["Cats", "Dogs", "Snakes"],
      type: "object"
    },
    {
      string: "42",
      expected: 42,
      type: "number"
    },
    {
      string: "0.42",
      expected: 0.42,
      type: "number"
    },
    {
      string: "1,000",
      expected: 1000,
      type: "number"
    },
    {
      string: "false",
      expected: false,
      type: "boolean"
    },
    {
      string: "TRUE",
      expected: true,
      type: "boolean"
    },
    {
      string: "string with a number and comma: 42,300",
      expected: "string with a number and comma: 42,300",
      type: "string"
    },
    {
      string: "blabla",
      expected: "blabla",
      type: "string"
    },
    {
      string: "rj45",
      expected: "rj45",
      type: "string"
    },
    {
      string: "↑ capital raised is 74,220,000 ↑ employee count is 170",
      expected: "↑ capital raised is 74,220,000 ↑ employee count is 170",
      type: "string"
    }
  ];

  const tests2 = [
    {
      input: {
        attribute: {
          some: "value1",
          and: ["array", { one: "object" }, { "nested.test": "value3" }]
        },
        "attribute.child.child": "value2"
      },
      output: {
        attribute: {
          some: "value1",
          and: ["array", { one: "object" }, { nested: { test: "value3" } }],
          child: { child: "value2" }
        }
      }
    },
    {
      input: {
        attribute: {
          one: {
            two: "two"
          }
        },
        "attribute.one.three": "three"
      },
      output: {
        attribute: {
          one: {
            two: "two",
            three: "three"
          }
        }
      }
    }
  ];

  var bundle = {
    request: {
      url: "",
      method: "",
      auth: "",
      headers: "",
      params: ""
    },
    action_fields_full: {
      record: ""
    }
  };

  tests.forEach(function(test) {
    bundle.action_fields_full.record = { test: test.string };
    expect(Zap.update_pre_write(bundle).data).toEqual(
      '{"test":' + JSON.stringify(test.expected) + "}"
    );
    expect(typeof JSON.parse(Zap.update_pre_write(bundle).data).test).toEqual(
      test.type
    );
  });

  tests2.forEach(function(test) {
    bundle.action_fields_full.record = test.input;
    expect(Zap.update_pre_write(bundle).data).toEqual(
      JSON.stringify(test.output)
    );
  });
});
