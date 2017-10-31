import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

// ignore these
function defCategory(title = '', query = '', filters = []) {
  return {
    title,
    query,
    filters,
  };
}

function defFilter(name = '', param = '', attribute = '', isChecked = false) {
  return {
    name,
    param,
    'attribute?': attribute,
    isChecked,
  };
}
// reducers.tsx
const clickCheckboxReducer = (oldState, action) => {
  if (action.type !== 'TOGGLE_CHECKBOX') return oldState;
  var { categoryIndex, filterIndex } = action.value;
  var current_value =
    oldState.filterList[categoryIndex].filters[filterIndex].isChecked;
  var state = { ...oldState };
  state.filterList[categoryIndex].filters[
    filterIndex
  ].isChecked = !current_value;
  return state;
};

const initCheckboxesReducer = (oldState, action) => {
  if (action.type !== 'INIT_CHECKBOX') return oldState;
  var state = {
    ...oldState,
    filterList: initFromUrl(oldState.filterList, action.value),
  };
  return state;
};

// effects.tsx
// const isRunningInBrowser = () =>
//   window && window.history && typeof window.history.replaceState === 'function';
const filterOutUnchecked = ({ isChecked }) => isChecked;
const mapCategoryIntoQuery = ({ query, filters }) =>
  query +
  '=' +
  filters
    .filter(filterOutUnchecked)
    .map(({ param }) => param)
    .join(',');

async function updateUrlParams(filterList) {
  var activeCategories = filterList.filter(({ filters }) =>
    filters.some(filterOutUnchecked)
  );

  if (activeCategories.length === 0)
    return window.history.replaceState(null, null, './');
  var query = '?' + activeCategories.map(mapCategoryIntoQuery).join('&');
  window.history.replaceState(null, null, query);
}

function parseUrlParams(url) {
  if (url.split('?').length === 1) return [];
  return url
    .split('?')[1]
    .split('&')
    .map(categoryString => {
      var [query, params] = categoryString.split('=');
      return { query, params: params.split(',') };
    });
}

function initFromUrl(oldFilterList, url) {
  var activeFilterList = parseUrlParams(url);
  if (activeFilterList.length === 0) return oldFilterList;
  var filterList = [...oldFilterList];
  activeFilterList.forEach(({ query, params }) => {
    var currentCategoryIndex = filterList.findIndex(
      category => category.query === query
    );
    params.forEach(param => {
      var currentFilterIndex = filterList[
        currentCategoryIndex
      ].filters.findIndex(filter => filter.param === param);
      filterList[currentCategoryIndex].filters[
        currentFilterIndex
      ].isChecked = true;
    });
  });
  return filterList;
}

class App extends Component {
  state = {
    filterList: [
      defCategory('A', 'a', [
        defFilter('Z', 'z'),
        defFilter('X', 'x'),
        defFilter('C', 'c'),
      ]),
      defCategory('B', 'b', [
        defFilter('Z', 'z'),
        defFilter('X', 'x'),
        defFilter('C', 'c'),
      ]),
    ],
  };

  componentWillMount() {
    this.dispatchInit();
  }

  dispatchInit = () =>
    this.setState(oldState =>
      initCheckboxesReducer(oldState, { type: 'INIT_CHECKBOX', value: window.location.href })
    );

  dispatch = action =>
    this.setState(oldState => clickCheckboxReducer(oldState, action));

  render() {
    updateUrlParams(this.state.filterList);
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <div className="App-intro">
          {this.state.filterList.map(
            (
              { name: categoryName, param: categoryParam, filters },
              categoryIndex
            ) => (
              <div>
                Category group {categoryName}
                <div>
                  {filters.map(
                    (
                      { name: filterName, param: categoryParam, isChecked },
                      filterIndex
                    ) => (
                      <label>
                        {filterName}
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            this.dispatch({
                              type: 'TOGGLE_CHECKBOX',
                              value: { categoryIndex, filterIndex },
                            })}
                        />
                      </label>
                    )
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    );
  }
}

export default App;
