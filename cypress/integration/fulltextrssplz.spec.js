describe('fulltextrssplz', () => {
  it('support bookmarklet', () => {
    cy.visit('/?feed=https://news.un.org/feed/subscribe/en/news/all/rss.xml')
    cy.contains('/feed?url=https://news.un.org/feed/subscribe/en/news/all/rss.xml&format=RSS')
  })
})
