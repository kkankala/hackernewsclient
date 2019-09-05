import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
import {Table,ButtonWithLoading} from "./Table";
import {Search} from "./Search";

const DEFAULT_QUERY = 'redux';
const  DEFAULT_HPP = '100';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage='

//Higher Order function. f(f(x))
// const isSearched = searchTerm => item =>
//   item.title.toLowerCase().includes(searchTerm.toLowerCase());

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      results: null,
      searchKey:'',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false
    };

    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
  }

  needsToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
  }

  onSearchSubmit(event) {
    event.preventDefault();
    const { searchTerm } = this.state;
    this.setState({searchKey:searchTerm});    
    if (this.needsToSearchTopStories(searchTerm)) {
    this.fetchSearchTopStories(searchTerm);
    }
  }

  fetchSearchTopStories(searchTerm, page = 0) {
    this.setState({isLoading: true})
    axios(
      `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`
    )
      .then(result => this.setSearchTopStories(result.data))
      .catch(error => this.setState({error}));
  }

  setSearchTopStories(result) {
    const {hits,page}=result;
    const {searchKey,results}=this.state;

    const oldHits = results && results[searchKey] ? results[searchKey].hits : [];

    const updatedHits = [...oldHits,...hits];
    // console.log("Set Search top Stories:",updatedHits)
    this.setState({
      results: {
      ...results,
      [searchKey]: { hits: updatedHits, page }
      },
      isLoading: false
      });
    // console.log(this.state);
  }

  onDismiss(id) {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];

    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);

    this.setState({ results: {...results, [searchKey]: { hits: updatedHits,page } }});
  }

  componentDidMount() {
    const { searchTerm } = this.state;
    this.setState({searchKey:searchTerm});
    this.fetchSearchTopStories(searchTerm);
  }

  render() {
    const { searchTerm, results,searchKey,error,isLoading } = this.state;
    
    const page = (results && results[searchKey] && results[searchKey].page) || 0;

    const list = (results && results[searchKey] && results[searchKey].hits) || [];
    

    return (
      <div className="page">
        <div className="interactions">
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >
            Search
          </Search>
        </div>
          { error ?
            <div className="interactions">
              <p>Something went wrong.</p>
            </div> :
            <Table
              list={list}
              onDismiss={this.onDismiss}
            />
          }
        <div className="interactions">
          
          <ButtonWithLoading isLoading={isLoading}
            onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}
          >
            More
          </ButtonWithLoading>
          
        </div>
      </div>
    );
  }
}



export default App;
