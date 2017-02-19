window.onload = function(){
  console.log($('#comments'));
  $('#loadComments').click(function(){
    //Falls wir keine andere Lösung finden, müssen wir hier
    //node.js verwenden um den Header serverseitig richtig
    //zu setzen.
    $.ajax({
      dataType: "json",
      url: 'data/articleComments.json',
      success: function(res){
        console.log(res);
      }
    });
    $.ajax({
      url: 'NewCommentTemplate.html',
      success: function(res){
        console.log(res);
        console.log($('#comments'));
        $('#comments').append(res);
      }
    });
  });
}
