# Waffle

High Unite Database GraphQL API

## Accessing the API

Access the API via [https://waffle.highunite.org](https://waffle.highunite.org)
[GraphiQL](https://waffle.highunite.org/graphiql)

### Data Types

The API will return data with different types, it is expected that your code will handle the type and its fallback value (when value is not available/empty)

| Type           | Encoding                                                                                                             | Fallback value |
| -------------- | -------------------------------------------------------------------------------------------------------------------- | -------------- |
| `String`       | UTF-8                                                                                                                | `null`         |
| `Number / Int` | Int                                                                                                                  | `null`         |
| `Object`       | JSON                                                                                                                 | `{}`           |
| `Date`         | [ISO time string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString) | `null`         |

> On objects that do not have values, the default return value of the API will be `false`
