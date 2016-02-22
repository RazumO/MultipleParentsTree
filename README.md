# Multiple Parents Tree
Based on d3 tree layout, tree with ability for child nodes to have multiple parents.

I`ve tried to find component to visualize data with tree graph, with ability to childs node to have multiple parents. And found one, it is d3 library 'force' layout. But it's very hard to handle positions of nodes and links for graph in this layout. So I've decided to create own component based on d3 tree layout (It assumed only one parent node and child's one).

I've added ability to dynamically create new nodes and very simple configuration object. You can find it demonstration here: http://razumo.github.io/MultipleParentsTree/
