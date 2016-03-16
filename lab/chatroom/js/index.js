/**
 * Created by johnnycage on 16/3/16.
 */
(function ($, undefined) {

    $(function () {

        var db = new Wilddog("https://wild-horse-6428.wilddogio.com/chat"),
            messagesDB = db.child("messages");

        var $room = $('#room'),
            $name = $('#name'),
            $content = $('#content'),
            $chatForm = $('#chatForm'),
            $messageTpl = $('#message-tpl'),
            $alert = $('#alert'),
            $changeName = $('#changeName');

        var addMessage = function (obj, target) {
            var message = $($messageTpl.html()),
                isSelf = $name.val() === obj.name;

            $('.name', message).text(obj.name);
            $('.inner-content', message).text(obj.content);
            message.find('.time').text(obj.time);

            if (isSelf) {
                message.addClass('self');
            }

            target.append(message);
        };

        var refreshChat = function (target) {
            messagesDB.once("value", function (snapshot) {
                var list = snapshot.val();

                target.empty();
                for (var id in list) {
                    if (list.hasOwnProperty(id)) {
                        addMessage(list[id], target);
                    }
                }
            });
        };

        var message = {
            error: function (info) {
                $alert.text(info);
            }
        };

        messagesDB.on('child_added', function (snapshot) {
            addMessage(snapshot.val(), $room);
        });

        $name.on('input', function () {
            $changeName.prop('disabled', !$name.val())
        });

        var setName = function () {
            if ($name.prop('readonly')) {
                $name.prop('readonly', false);
                $changeName.text('确定');
            } else {
                $name.prop('readonly', true);
                $changeName.text('更改');

                localStorage.setItem('name', $name.val());

                refreshChat($room);
            }
        };

        $changeName.on('click', function () {
            setName();
        });

        var defaultName = localStorage.getItem('name');

        if (defaultName) {
            $name.val().trigger('input');
            setName();
        }

        $chatForm.on('submit', function (event) {
            event.preventDefault();

            $alert.text('');

            var name = $name.val(),
                content = $content.val(),
                time = new Date().toLocaleString();

            if (!name) {
                message.error('请先输入姓名');
                return;
            }

            if (!content) {
                message.error('请输入聊天内容');
                return;
            }

            messagesDB.push({
                name: name,
                content: content,
                time: time
            });

            $chatForm[0].reset();
        });
    });

})(jQuery);