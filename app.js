const {Component} = React
const {render} = ReactDOM
const {HashRouter, Route, Link, Switch, Redirect} = ReactRouterDOM

const API = 'https://acme-users-api-rev.herokuapp.com/api';


const fetchUser = async ()=> {
    const storage = window.localStorage;
    const userId = storage.getItem('userId'); 
    if(userId){
    try {
        return (await axios.get(`${API}/users/detail/${userId}`)).data;
    }
    catch(ex){
        storage.removeItem('userId');
        return fetchUser();
    }
    }
    const user = (await axios.get(`${API}/users/random`)).data;
    storage.setItem('userId', user.id);
    return  user;
};



class Form extends Component {
    constructor() {
        super()
        this.state = {
            category: '',
            url: ''
        }
        this.create = this.create.bind(this)
    }
    create() {
        const {category, url} = this.state
        this.props.create({category, url})

    }
    render() {
        const {url, category} = this.state
        const {create} = this
        return (
            <div>
                <form onSubmit={(ev)=> ev.preventDefault()}>
                    <input value={url} placeholder='url' onChange={(ev)=> this.setState({url: ev.target.value})}/>
                    <input value={category} placeholder='category' onChange={(ev)=> this.setState({category: ev.target.value})}/>
                    <button onClick={create}>Create</button>
                </form>
            </div>
        )
    }
}



const BookmarkURLs = ({bookmarks, destroy, create, match}) => {
    const filter = match.params.filter
    let filtered = bookmarks
    if(filter){
        filtered = filtered.filter(bmurl => {
            if (filter === bmurl.category) {
                return bmurl
            }
        })
    }
    return (
        <main>
            <nav>
                <Link to='/video' className={filter === 'video' ? 'selected': ''}>Video</Link>
                <Link to='/forum' className={filter === 'forum' ? 'selected': ''}>Forum</Link>
                <Link to='/news' className={filter === 'news' ? 'selected': ''}>News</Link>
            </nav>
            <Form create={create}/>
            <ul>{
                filtered.map((eachMark, idx) => {
                    return (
                        <div key={idx} className='url'>
                            <Link to='/'>{eachMark.url}</Link>
                            <button onClick={()=> destroy(eachMark)}>Destroy</button>
                        </div>     
                    )
                })        
            }</ul>  
        </main>
    )
}



class App extends Component {
    constructor() {
        super()
        this.state = {
            user: {},
            bookmarks: []
        }
        this.destroy = this.destroy.bind(this)
        this.create = this.create.bind(this)
        this.update = this.update.bind(this)
    }
    
    async create(bookmark) {
        const newBookmark = await axios.post(`${API}/users/${this.state.user.id}/bookmarks`, bookmark);
        const bookmarks = [...this.state.bookmarks, newBookmark]
        this.setState({bookmarks});
    }

    async componentDidMount() {
        const user = await fetchUser()
        const bookmarks = (await axios.get(`${API}/users/${user.id}/bookmarks`)).data
        this.setState({user, bookmarks})
    }

    async update(){
        const updated = (await axios.put(`${API}/users/${this.state.user.id}/bookmarks/${bookmarks.id}`, { category: '', url: ''})).data;
        this.setState({ bookmarks : this.state.bookmarks.map( bm => bm.id === updated.id ? updated : bm)});
      }

    async destroy(bookmark) {
        await axios.delete(`${API}/users/${this.state.user.id}/bookmarks/${bookmark.id}`);
        this.setState({ bookmarks : this.state.bookmarks.filter( _bm => _bm.id !== bookmark.id)});
    }

    render() {
        const {user, bookmarks} = this.state
        const {destroy, create} = this
        return (
            <HashRouter>
                <h2> {user.fullName} ({bookmarks.length} Bookmarks)</h2>
                <Route path='/:filter?' render={(props) => <BookmarkURLs {...props} bookmarks={bookmarks} destroy={destroy} create={create}/>}/>
            </HashRouter>

            
        )
    }
}




const root = document.querySelector('#root');
ReactDOM.render(<App/>, root);