/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only.  Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import 'todomvc-common'

import React from 'react'
import ReactDOM from 'react-dom'

import { QueryRenderer, graphql } from 'react-relay'
import QueryLookupRenderer from 'relay-query-lookup-renderer'
import { Environment, Network, RecordSource, Store } from 'relay-runtime'

import TodoApp from './components/TodoApp'

function fetchQuery(operation, variables) {
  return fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: operation.text,
      variables,
    }),
  }).then(response => {
    return response.json()
  })
}

const modernEnvironment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),
})

class ReproductionCase extends React.Component {
  state = {
    first: 10,
    status: 'any',
  }
  onToggleStatus = () => {
    this.setState(({ status }) => ({
      status: status === 'any' ? 'complete' : 'any',
    }))
  }

  render() {
    return (
      <React.Fragment>
        <div>
          <h1>fetching todos with status {this.state.status}</h1>
          <button
            style={{
              padding: '2px 6px 3px',
              borderWidth: '2px',
              borderStyle: 'outset',
              borderColor: 'buttonface',
              borderImage: 'initial',
              WebkitAppearance: 'button',
              color: 'buttontext',
              backgroundColor: 'buttonface',
            }}
            type="button"
            onClick={this.onToggleStatus}
          >
            toggle status to {this.state.status === 'any' ? 'complete' : 'any'}
          </button>
        </div>
        <QueryLookupRenderer
          lookup
          retain
          environment={modernEnvironment}
          query={graphql`
            query appQuery($status: String) {
              viewer {
                ...TodoApp_viewer @arguments(status: $status)
              }
            }
          `}
          variables={{
            status: this.state.status,
          }}
          render={({ error, props }) => {
            if (props) {
              return <TodoApp viewer={props.viewer} />
            } else {
              return <div>Loading</div>
            }
          }}
        />
      </React.Fragment>
    )
  }
}

ReactDOM.render(<ReproductionCase />, document.getElementById('root'))
