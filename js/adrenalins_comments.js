var comment_reordering = {
    locked: false,
    wait: false,
    reorder: function () {
        if (comment_reordering.locked) {
            comment_reordering.wait = true;
        } else {
            comment_reordering.locked = true;
            comment_reordering.wait = false;
            var commentElements = {};
            var commentParentClones = {};
            var needReordering = false;
            var prevCommentId = '';
            for (var i = 0; i < commentThreadElement.children.length; i++) {
                var commentElement = commentThreadElement.children[i];

                if (!commentElement.hasAttribute("commentid")) {
                    var commentId = getCommentId(commentElement);
                    if (commentId) {
                        if (prevCommentId > commentId && i > 0) {
                            needReordering = true;
                        }

                        commentElements[commentId] = commentElement;

                        for (var class_i = 0; class_i < commentElement.classList.length; class_i++) {
                            var className = commentElement.classList.item(class_i);
                            if (className !== 'fos_comment_comment_depth_0' && className.startsWith('fos_comment_comment_depth_')) {
                                commentElement.classList.remove(className);
                                commentElement.classList.add('fos_comment_comment_depth_0');
                                //console.log(commentElement.textContent);

                                if (!commentElement.querySelector("div.fos_comment_comment_body div.comment_parent")) {
                                    var parentComment = commentElements[commentElement.getAttribute("data-parent")];
                                    if (parentComment) {
                                        var commentsBody = parentComment.querySelector("div.comment-data");
                                        if (commentsBody) {
                                            var parentCommentClone = commentsBody.cloneNode(true);
                                            parentCommentClone.style.backgroundColor = 'lightgrey';
                                            parentCommentClone.classList.add('small');
                                            parentCommentClone.classList.add('comment_parent');

                                            var replyElement = parentCommentClone.querySelector('a.fos_comment_comment_reply_show_form');
                                            if (replyElement) {
                                                replyElement.parentElement.removeChild(replyElement);
                                            }


                                            commentParentClones[commentId] = parentCommentClone;
                                        }
                                    }
                                }
                            }
                        }
                        prevCommentId = commentId;

                    }
                }
            }
            if (needReordering) {
                var commentIdsOrdered = Object.keys(commentElements).reverse();
                for (var i in commentIdsOrdered) {
                    var commentElement = commentElements[commentIdsOrdered[i]];
                    if (commentElement) {
                        if (commentElement != commentElement.parentElement.children[0]) {
                            commentElement.parentElement.insertBefore(commentElement, commentElement.parentElement.children[0]);

                            var commentParentClone = commentParentClones[commentIdsOrdered[i]];
                            if (commentParentClone) {
                                var commentData = commentElement.querySelector("div.fos_comment_comment_body");
                                if (commentData) {
                                    commentData.parentElement.insertBefore(commentParentClone, commentData);
                                }
                            }
                        }
                    }
                }
            }

            comment_reordering.locked = false;
            if (comment_reordering.wait) {
                comment_reordering.reorder();
            }
        }
    }
};

var getCommentId = function (element) {
    var match = /fos_comment_(\d+)/g.exec(element.getAttribute("id"));
    if (match) {
        return match[1];
    }
    return undefined;
}

var commentThreadElement = document.getElementById('fos_comment_thread');
if (commentThreadElement) {
    var commentsHeading = document.querySelector("section[id=comments] div.section-heading");
    if (commentsHeading) {
        var a = document.createElement('a');
        a.setAttribute('href', '#');
        a.onclick = function () { comment_reordering.reorder(); return false; };
        a.innerHTML = "&#8668;";
        a.style.fontSize = "large"
        commentsHeading.appendChild(a);

    }
    /*
    commentThreadElement.addEventListener("DOMNodeInserted", function (ev) {
      comment_reordering.reorder();
    }, false);
    */
}