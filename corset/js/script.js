var codes = [],
    titles = []
$(function () {
    for (var k in modb) {
      if (modb.hasOwnProperty(k)) {
        codes.push(k)
        titles.push(modb[k].title)
      }
    }
    function displayResults(matches) {
      $(".result").remove()
      for(var i = 0; i < matches.length; i++) {
        if(!(matches[i] in modb)) {
          continue
        }
        $("<div>",
          {
            "data-code": matches[i],
            "class": "result"
          }
        )
          .html('<span class="heading">' + matches[i] + " | " +
          modb[matches[i]].mc + " MCs" + "</span>" +
          "<br/>" +
          '<span class="title">' + modb[matches[i]].title + '</span>' + "<br/>" +
          (modb[matches[i]].desc ? modb[matches[i]].desc + "<br/>" : "") +
          (modb[matches[i]].prereq ? modb[matches[i]].prereq + "<br/>" : "") +
            (modb[matches[i]].preclusion ? modb[matches[i]].preclusion + "<br/>" : "") +
            (modb[matches[i]].workload ? modb[matches[i]].workload.join("-") + "<br/>" : ""))
          .draggable({
            addClasses:false,
            cursor:"move",
            revert:"invalid",
            helper:"clone",
            opacity:0.5,
            zIndex:1,
            appendTo:"body",
            scroll: false
          })
          .data("code", matches[i])
          .hover(
          function () {
            $(this).css("height", "auto");
          },
          function () {
            $(this).css("height", "73px");
          }
          )
          .appendTo("#results")
      }
    }
    //displayResults(["MA1101R"])
    function findText(val) {
      if(val === "") return []
      var matches = []
      for(var i = 0; i < codes.length; i++) {
        if(codes[i].search(new RegExp(val, "i")) !== -1) {
          if(matches.push(codes[i]) === 10) {
            return matches
          }
        }
      }
      for(i = 0; i < titles.length; i++) {
        if(titles[i].search(new RegExp(val, "i")) !== -1) {
          if(matches.push(codes[i]) === 10) {
            return matches
          }
        }
      }
      for(var k in modb) {
        if (modb.hasOwnProperty(k) && modb[k].desc) {
          if(modb[k].desc.search(new RegExp(val, "i")) !== -1) {
            if(matches.push(k) === 10) {
              return matches
            }
          }
        }
      }
      return matches
    }
    $("#search").keyup(function(event) {
      displayResults(findText($(this).val()))
      return false
    })
    //$.fn.qtip.defaults.style.classes = "ui-tooltip-light ui-tooltip-shadow ui-tooltip-rounded";
    $("table").droppable({
      accept:".result",
      drop:function (event, ui) {
        //console.log(ui.draggable.data("code"))
        addMod(ui.draggable.data("code"))
      }
    })
    $("#query").droppable({
      activeClass: "instructions",
      accept:".filled",
      drop:function(event, ui) {
        $("[data-code='" + ui.draggable.attr("data-code") + "']").remove()
      }
    })
    var modules = []
    var classTypeMap = [ "DESIGN LECTURE", "LABORATORY", "LECTURE",
      "PACKAGED LECTURE", "PACKAGED TUTORIAL",
      "SECTIONAL TEACHING", "SEMINAR-STYLE MODULE CLASS",
      "TUTORIAL", "TUTORIAL TYPE 2", "TUTORIAL TYPE 3"]
    var shortTypeMap = ["LEC", "LAB", "LEC", "LEC", "TUT", "SEC", "SEM", "TUT",
      "TUT2", "TUT3"]
    function weekToString(weeks) {
      if(weeks === 0) {
        return ""
      }else if(weeks === 1) {
        return "ODD"
      } else if(weeks === 2) {
        return "EVEN"
      } else {
        if(weeks.length === 0) {
          return ""
        }
        var weekStr = "Wk "
        weekStr += weeks[0]
        for(var i = 0; i<weeks.length-1; i++) {
          if(weeks[i+1] !== weeks[i] + 1) {
            if(i !== 0 && weeks[i - 1] === weeks[i] - 1) {
              weekStr += "-" + weeks[i]
            }
            weekStr += ", " + weeks[i + 1]
          }
        }
        if(weeks[i - 1] === weeks[i] - 1) {
          weekStr += "-" + weeks[i]
        }
        return weekStr
      }
    }
    function addMod(code) {
      if(modules.indexOf(code) !== -1) {
        return
      }
      modules.push(code)
      var mod = modb[code]
      var classes = [];
      var color = Math.floor(Math.random()*11)
      if (mod.lectures) classes.push(mod.lectures)
      if (mod.tutorials) classes.push(mod.tutorials)
      for (var i = classes.length; i--;) {
        for (var type in classes[i]) {
          var count = 0
          for (var label in classes[i][type]) {
            var timings = classes[i][type][label]
            for (var j = timings.length; j--;) {
              (function (code, type, label) {
                $("<div>",
                  {
                    "data-code":code,
                    "data-type":type,
                    "data-label":label,
                    "class":count === 0 ? "filled" : "slot",
                    "id":code + "-" + type + "-" + label + "-" + j
                  }
                )
                  .addClass("color" + color)
                  .html(code + "<br/>" +
                    shortTypeMap[type] + " [" + label + "]" + "<br/>" +
                    timings[j].venue + "<br/>" +
                    weekToString(timings[j].weeks)
                )
                  .draggable({
                    addClasses:false,
                    cursor:"move",
                    revert:"invalid",
                    helper:"clone",
                    opacity:0.5,
                    zIndex:1,
                    appendTo:"body",
                    start:function (event, ui) {
                      $("[data-code='" + code + "']" +
                        "[data-type='" + type + "']" +
                        "[class*='slot']").show()
                    },
                    stop:function (event, ui) {
                      $("[data-code='" + code + "']" +
                        "[data-type='" + type + "']" +
                        "[class*='slot']").hide();
                    }
                  })
                  .droppable({
                    accept:"[data-code='" + code + "']" +
                      "[data-type='" + type + "']",
                    activeClass:"active",
                    addClasses:false,
                    hoverClass:"hover",
                    drop:function (event, ui) {
                      $("[data-code='" + code + "']" +
                        "[data-type='" + type + "']" +
                        "[data-label='" + ui.draggable.attr("data-label") + "']"
                      ).toggleClass("filled slot")
                      $("[data-code='" + code + "']" +
                        "[data-type='" + type + "']" +
                        "[data-label='" + label + "']"
                      ).toggleClass("filled slot")
                    }
                  })
                  .appendTo("#" + timings[j].day + timings[j].start)
              })(code, type, label)
            }
            count += 1
          }
          if (count === 1) {
            $("[data-code='" + code + "']" +
              "[data-type='" + type + "']")
              .draggable("destroy")
              .addClass("onlyone")
          }
        }
      }
    }
    var modmod = ["CS1010", "CE2112", "MA1101R", "CS2100"]
    for (var i = modmod.length;i--;) {
      addMod(modmod[i])
    }
  }
)