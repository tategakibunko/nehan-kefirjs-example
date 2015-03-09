$(function(){
  var $screen = $("#screen").hide();
  var $page_no = $("#page-no");
  var $page_count = $("#page-count");
  var page_count_stream = Kefir.bus();
  var next_click_stream = $("#next").asKefirStream("click");
  var prev_click_stream = $("#prev").asKefirStream("click");
  var click_value_stream = Kefir.merge([next_click_stream.mapTo(1), prev_click_stream.mapTo(-1)]);
  var page_index_stream = Kefir.combine([click_value_stream, page_count_stream], function(value, count){
    return {value:value, count:count};
  }).scan(function(acm, cur){
    return {
      value:Math.max(0, Math.min(cur.count - 1, acm.value + cur.value)), // 0 ~ [cur.count - 1]
      count:cur.count
    };
  }, {value:0, count:0}).map(function(obj){
    return obj.value;
  });

  var paged_element = Nehan.createPagedElement();

  next_click_stream.onValue(function(e){
    e.preventDefault();
  });

  prev_click_stream.onValue(function(e){
    e.preventDefault();
  });

  page_index_stream.onValue(function(index){
    $page_no.html(index+1);
    paged_element.setPage(index);
  });

  page_count_stream.onValue(function(count){
    $page_count.html(count);
  });

  // start generating paged-media.
  paged_element.setStyle("body", {
    "flow":"tb-rl", // or "lr-tb"
    "font-size":16,
    "width":500,
    "height":300
  }).setContent($screen.html(), {
    onProgress:function(tree){
      page_count_stream.emit(tree.pageNo + 1);
    }
  });

  // set DOM of current page.
  $screen.after(paged_element.getElement());
});
