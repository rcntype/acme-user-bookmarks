
const Nav = ({path, bookmarks}) => {
    let categories = []
    return (
        <nav>{
            bookmarks.map((bm, idx) => {
                if (!categories.includes(bm.category)) {
                    categories.push(bm.category)
                    return (
                        <Link to={bm.category} key={idx}>{bm.category}</Link>
                    )
                }
            })
        }</nav>
    )
}

//.filter(filteredbm => filteredbm.id === bookmarks.id)
const BookmarkURLs = ({bookmarks, destroy}) => {
    return (
        <ul>{
            bookmarks.map((eachMark, idx) => {
                return (
                    <div key={idx} className='url'>
                        <Link to='/'>{eachMark.url}</Link>
                        <button onClick={()=> destroy(eachMark)}>Destroy</button>
                    </div>     
                )
            })        
        }</ul>
    )
}



    render() {
        const {user, bookmarks} = this.state
        const {destroy, create, update} = this
        let categories = []
        return (
            <HashRouter>
                <h2> {user.fullName} ({bookmarks.length} Bookmarks)</h2>
                <Route render={(location) => <Nav path={location.pathname} bookmarks={bookmarks}/>}/>
                <Route render={()=> <Form create={create} update={update} bookmarks={bookmarks}/>}/>
                <Switch>
                    {/* <Route path={bookmarks.category} render={()=> <BookmarkURLs bookmarks={bookmarks} destroy={destroy}/>}/> */}
                    <Route path='/video' render={()=> <BookmarkURLs bookmarks={bookmarks} destroy={destroy}/>}/>
                    


                
                </Switch>
            </HashRouter>

            
        )
    }
}
