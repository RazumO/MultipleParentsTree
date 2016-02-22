(function () {
  var linksData = [
    { "product_id": 6, "name": "CallOfDuty", "parents_id": [{id: 3, "type": "downsale"}]},
    { "product_id": 1, "name": "World Of Warcraft", "parents_id": [{id: 2, "type": "upsale"}]},
    { "product_id": 2, "name": "Prince of Persia", "parents_id": null },
    { "product_id": 3, "name": "Assassin's Creed", "parents_id": [{id: 1, "type": "upsale"}]},
    { "product_id": 4, "name": "Diablo", "parents_id": [{id: 1, "type": "downsale"}]},
    { "product_id": 5, "name": "Lineage 2 Classic", "parents_id": [{id: 2, "type": "downsale"}]},
    { "product_id": 7, "name": "CounterStrike 1.6", "parents_id": [{id: 5, "type": "upsale"}, {id: 4, "type": "upsale"}]},
    { "product_id": 8, "name": "GTA San Andreas", "parents_id": [{id: 7, "type": "downsale"},
        {id: 4, "type": "downsale"}]},
    { "product_id": 9, "name": "Cossacks: European battles", "parents_id": [{id: 8, "type": "downsale"},
        {id: 5, "type": "downsale"}]}
  ],
    $productsSelect = $('select.products-select'),
    svg,
    DOWNSALE_TYPE = 'downsale',
    UPSALE_TYPE = 'upsale',
    SVG_WIDTH = 1400,
    SVG_HEIGHT = 500,
    SVG_MARGIN = {top: 20, right: 120, bottom: 20, left: 120},
    MARKER_CLASS_END = '_marker',
    UPSALE_MARKER_CLASS = "upsale",
    DOWNSALE_MARKER_CLASS =  "downsale",
    CLASS_TO_HIDE_ELEMENT = 'hidden',
    LINK_CLASS = 'link',
    NODE_CLASS = 'node',
    SPACE_BETWEEN_DEPTH_LEVELS = 180,
    TOP_DIRECTED_LINK_PATH_COORD = 0,
    BOTTOM_DIRECTED_LINK_PATH_COORD = 500,
    MARKER_CSS_STYLES = {
      viewBox: '0 -5 10 10',
      refX: 18,
      refY: 0,
      markerWidth: 6,
      markerHeight: 6,
      orient: 'auto'
    },
    CIRCLE_CSS_STYLES = {
      r: 10,
      fill: '#fff',
      fillOpacity: 1,
      text: {
        dy: '-1em',
        dx: {
          left: '13px',
          right: '-13px;'
        }
      }
    },
    renderOptions = {
      svgWidth: SVG_WIDTH,
      svgHeight: SVG_HEIGHT,
      svgMargin: SVG_MARGIN,
      classes: {
        classToHideElement: CLASS_TO_HIDE_ELEMENT,
        linkClass: LINK_CLASS,
        nodeClass: NODE_CLASS
      },
      spaceBetweenDepthLevels: SPACE_BETWEEN_DEPTH_LEVELS,
      topDirectedLinkPathCoord: TOP_DIRECTED_LINK_PATH_COORD,
      bottomDirectedLinkPathCoord: BOTTOM_DIRECTED_LINK_PATH_COORD,

      markerClassEnd: MARKER_CLASS_END,
      upsaleMarkerClass: UPSALE_MARKER_CLASS + MARKER_CLASS_END,
      downsaleMarkerClass: DOWNSALE_MARKER_CLASS + MARKER_CLASS_END,
      markerCssStyles: MARKER_CSS_STYLES,

      circleCssStyles: CIRCLE_CSS_STYLES
    };

  function GraphLink(params) {
    return {
      name: params.name || '--',
      parents_id: params.parents_id || null,
      type: params.type || undefined,
      product_id: params.product_id
    };
  }

  function Node(params) {
    return {
      name: params.name || '--',
      parent: params.parent || null,
      type: params.type || UPSALE_TYPE
    };
  }
  function reduceArray(arr) {
    return arr.reduce(function (map, item) {
      map[item.product_id] =  item;
      return map;
    }, {});
  }

  function generateTree(realData) {
    var data = JSON.parse(JSON.stringify(realData)),
      dataMap = reduceArray(data),
      treeData = [];

    //Adding data-target attribute with id's of targets of every node
    data.forEach(function (node, index) {
      node.index = index;
      if (node.parents_id) {
        var parentLength = node.parents_id.length;
        node.parents_id.forEach(function (parentItem, index) {
          var parent = dataMap[parentItem.id];
          if (parentLength > 1) {
            if (index !== parentLength - 1) {
              if (!parent.data_targets_id) {
                parent.data_targets_id = [{id: node.product_id, type: parentItem.type}];
              } else {
                parent.data_targets_id.push({id: node.product_id, type: parentItem.type});
              }
              return;
            }
          }
          parent.children =  parent.children || [];
          node.type = parentItem.type;
          parent.children.push(node);
        });
      } else {
        treeData.push(node);
      }

    });

    function addEmptyNodes(node) {
      var upsaleNode,
        downsaleNode,
        someNode;
      if (node.children) {
        //Should to add only 1 empty node
        node.children.forEach(function (child) {
          addEmptyNodes(child);
        });

        if (node.children.length === 1) {
          someNode = new Node({
            parent: node
          });
          if (node.children[0].type === UPSALE_TYPE) {
            someNode.type = DOWNSALE_TYPE;
          } else {
            someNode.type = UPSALE_TYPE;
          }

          if (node.data_targets_id) {
            node.data_targets_id.forEach(function (currentTarget) {
              if (currentTarget.type !== node.children[0].type) {
                someNode.hidden = true;
              }
            });
          }

          node.children.push(someNode);
        }
        //Change upsale to be first, cause it will be displayed by d3 as top node of two children
        node.children.sort(function (child) {
          return child.type === DOWNSALE_TYPE ? 1 : -1;
        });

      } else {
        //Should to add 2 empty nodes
        upsaleNode = new Node({
          parent: node,
          type: UPSALE_TYPE
        });
        downsaleNode = new Node({
          parent: node,
          type: DOWNSALE_TYPE
        });
        if (node.data_targets_id) {
          node.data_targets_id.forEach(function (currentTarget) {
            if (currentTarget.type === UPSALE_TYPE) {
              upsaleNode.hidden = true;
            } else {
              downsaleNode.hidden = true;
            }
          });
        }
        node.children = [upsaleNode, downsaleNode];
      }
    }
    addEmptyNodes(treeData[0]);
    return treeData[0];
  }

  function drawNodes(nodes) {
    var i = 0,
      node = svg.selectAll("g.node")
        .data(nodes, function (d) {
          if (!d.id) {
            i += 1;
            d.id = i;
          }
          return d.id;
        });
    return node.enter().append("g")
      .attr("class", function (d) {
        var nodeClasses = renderOptions.classes.nodeClass;
        if (d.hidden) {
          nodeClasses += ' ' + renderOptions.classes.classToHideElement;
        }
        return nodeClasses;
      })
      .attr("data-index", function (d) {
        return d.index;
      })
      .attr("data-parent-index", function (d) {
        if (d.parent) {
          return d.parent.index;
        }
      })
      .attr("data-type", function (d) {
        return d.type;
      })
      .attr("transform", function (d) {
        return "translate(" + d.y + "," + d.x + ")";
      });
  }

  function drawLinks(links, nodes) {
    var diagonal = window.d3.svg.diagonal()
        .projection(function (d) {
          return [d.y, d.x];
        }),
      link,
      nodesMap,
      targets,
      maxTargetsCount;
    //Drawing links for one parent
    nodesMap = reduceArray(nodes);
    link = svg.selectAll("path.link")
      .data(links, function (d) {
        return d.target.id;
      });
    link.enter().insert("path", "g")
      .attr("class", function (d) {
        var linkClasses = renderOptions.classes.linkClass + " " + d.target.type;
        if (d.source.data_targets_id) {
          targets = d.source.data_targets_id;
          targets.forEach(function (currentTarget) {
            if (currentTarget.type === d.target.type) {
              linkClasses += ' ' + renderOptions.classes.classToHideElement;
            }
          });
        }
        return linkClasses;
      })
      .attr("d", function (d) {
        return diagonal(d);
      })
      .attr("marker-end", function (d) {
        return "url(#" + d.target.type + renderOptions.markerClassEnd + ")";
      });


    maxTargetsCount = 0;

    //Adding links in case when it is several parents for one node
    function addSpecialParent(position) {
      link.enter().insert("path", "g")
        .attr("d", function (d) {
          if (d.source.data_targets_id) {
            targets = d.source.data_targets_id;
            var length = targets.length,
              sep = ',',
              newPath = '',
              path,
              pathDigitsMas,
              pathDigitsAndSpacesMas,
              spaceCoord;
            if (length > maxTargetsCount) {
              maxTargetsCount = length;
            }
            if (position < length) {
              d.target = nodesMap[targets[position].id];
            } else {
              return;
            }

            //Conputing to which direction will be directed bezier link: top or bottom
            path = diagonal(d);
            pathDigitsMas = path.match(/([0-9\.])+/g);
            pathDigitsAndSpacesMas = path.match(/([A-Za-z0-9_ \.])+/g);

            pathDigitsAndSpacesMas.forEach(function (word, index) {
              if (index !== 3) {
                newPath += word;
              } else {
                if (targets[position].type === UPSALE_TYPE) {
                  spaceCoord = renderOptions.topDirectedLinkPathCoord;
                } else {
                  spaceCoord = renderOptions.bottomDirectedLinkPathCoord;
                }
                newPath += spaceCoord + ' ' + pathDigitsMas[6];
              }
              if (index !== 4) {
                newPath += sep;
              }
            });

            return newPath;
          }
        })
        .attr("class", function (d) {
          if (d.source.data_targets_id) {
            targets = d.source.data_targets_id;
            if (position < targets.length) {
              return renderOptions.classes.linkClass + ' ' + targets[position].type;
            }
          }
        })
        .attr("marker-end", function (d) {
          if (d.source.data_targets_id) {
            targets = d.source.data_targets_id;
            if (position < targets.length) {
              return "url(#" + targets[position].type + renderOptions.markerClassEnd + ")";
            }
          }
        });

    }
    addSpecialParent(0);
    if (maxTargetsCount === 2) {
      addSpecialParent(1);
    }
  }

  function renderTree(root, nodeClickHandler) {
    var margin = renderOptions.svgMargin,
      width = renderOptions.svgWidth - margin.right - margin.left,
      height = renderOptions.svgHeight - margin.top - margin.bottom,
      tree,
      nodes,
      nodeGroup,
      links,
      nodesMap,
      isBackRelations;

    tree = window.d3.layout.tree()
      .size([height, width]);

    svg = window.d3.select(".graph-container").append("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    ////Append arrow
    svg.append("svg:defs").selectAll("marker")
      .data([renderOptions.upsaleMarkerClass, renderOptions.downsaleMarkerClass])
      .enter().append("svg:marker")
      .attr("id", String)
      .attr("class", String)
      .attr("viewBox", renderOptions.markerCssStyles.viewBox)
      .attr("refX", renderOptions.markerCssStyles.refX)
      .attr("refY", renderOptions.markerCssStyles.refY)
      .attr("markerWidth", renderOptions.markerCssStyles.markerWidth)
      .attr("markerHeight", renderOptions.markerCssStyles.markerHeight)
      .attr("orient", renderOptions.markerCssStyles.orient)
      .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5");

    // Compute the new tree layout.
    nodes = tree.nodes(root).reverse();
    links = tree.links(nodes);

    nodesMap = reduceArray(nodes);

    function replaceNodeAndChildren(node, root, distance) {
      if (node.children) {
        node.children.forEach(function (child) {
          replaceNodeAndChildren(child, root, distance);
        });
      }
      node.y = (distance  + (node.depth - root.depth)) * renderOptions.spaceBetweenDepthLevels;
      node.depth = (distance  + (node.depth - root.depth));
    }

    // Normalize for fixed-depth.
    isBackRelations = false;

    nodes.forEach(function (d) {
      d.y = d.depth * renderOptions.spaceBetweenDepthLevels;
    });

    function addFixedDepth() {
      nodes.forEach(function (d) {
        if (d.data_targets_id) {
          var targets = d.data_targets_id;
          targets.forEach(function (currentTarget) {
            var target = nodesMap[currentTarget.id],
              source = d;
            if (source.y >= target.y) {
              isBackRelations = true;
              replaceNodeAndChildren(target, target, source.depth + 1);
              target.depth = source.depth + 1;
            }
          });
        }
      });
      if (isBackRelations) {
        isBackRelations = false;
        addFixedDepth();
      }
    }

    addFixedDepth();

    nodeGroup = drawNodes(nodes);

    nodeGroup.append("circle")
      .attr("r", renderOptions.circleCssStyles.r)
      .style("fill", renderOptions.circleCssStyles.fill);

    nodeGroup.append("text")
      .attr("x", function (d) {
        /*jslint nomen: true*/
        return d.children || d._children ? renderOptions.circleCssStyles.text.right : renderOptions.circleCssStyles.text.left;
      })
      .attr("dy", renderOptions.circleCssStyles.text.dy)
      .attr("text-anchor", function (d) {
        /*jslint nomen: true*/
        return d.children || d._children ? "end" : "start";
      })
      .text(function (d) { return d.name; })
      .style("fill-opacity", renderOptions.circleCssStyles.fillOpacity);

    drawLinks(links, nodes);

    $('.' + renderOptions.classes.nodeClass).on('click', nodeClickHandler);
  }

  function changeGraphLink(param) {
    var removedProductId,
      productIsDuplicated,
      newGraphLink;
    if (param.index !== undefined) {
      removedProductId = linksData[param.index].product_id;
      linksData[param.index].name = param.productToPaste.name;
      linksData[param.index].product_id = param.productToPaste.product_id;
      //Save previous product relations
      linksData.forEach(function (item) {
        if (item.parents_id) {
          item.parents_id.forEach(function (parentItem, index) {
            if (parentItem.id === removedProductId) {
              item.parents_id[index].id = param.productToPaste.product_id;
            }
          });
        }
      });
    } else {
      productIsDuplicated = false;
      linksData.forEach(function (item) {
        if (item.product_id === param.productToPaste.product_id) {
          item.parents_id.push({id: linksData[param.parentIndex].product_id, type: param.type});
          productIsDuplicated = true;
        }
      });
      if (!productIsDuplicated) {
        newGraphLink = new GraphLink({
          parents_id: [{id: linksData[param.parentIndex].product_id, type: param.type}],
          name: param.productToPaste.name,
          product_id: param.productToPaste.product_id
        });
        linksData.push(newGraphLink);
      }
    }
  }

  function nodeClickHandler() {
    var $target = $(this),
      template = app.productsSelectOptions,
      clickedNodeIndex = $target.data('index'),
      clickedNodeParentIndex = $target.data('parent-index'),
      clickedNodeType = $target.data('type'),
      productsFromSelect;
    //if (clickedNodeIndex) {
    //  dataToRender[clickedNodeIndex].selected = true;
    //}
    productsFromSelect = [{"name": "NewProduct1", product_id: 101},
      {"name": "NewProduct2", product_id: 102},
      {"name": "NewProduct3", product_id: 103},
      {"name": "NewProduct4", product_id: 104},
      {"name": "NewProduct5", product_id: 105},
      {"name": "NewProduct6", product_id: 106},
      {"name": "NewProduct7", product_id: 107},
      {"name": "NewProduct8", product_id: 108}];
    productsFromSelect.forEach(function (item, index) {
      item.index = index;
    });

    $productsSelect.html(Mustache.to_html(template, {data: productsFromSelect}));
    $productsSelect.select2();
    $('.funnel-modal').modal('toggle');

    function redrawGraph() {
      $('svg').remove();
      svg = null;
      renderTree(generateTree(linksData), nodeClickHandler);
    }

    $('.save-selected-product').off('click').on('click', function () {
      $('.funnel-modal').modal('toggle');
      var selectedProductIndex = +$productsSelect.val();
      changeGraphLink({
        index: clickedNodeIndex,
        parentIndex: clickedNodeParentIndex,
        type: clickedNodeType,
        productToPaste: productsFromSelect[selectedProductIndex]
      });
      redrawGraph();
    });
  }

  renderTree(generateTree(linksData), nodeClickHandler);

}());