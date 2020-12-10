module.exports = {
    description: 'Say hi',
    args: false,
    execute(msg) {
        const fu = ["fuck you",
            "fuk you",
            "fuck u",
            "fuk u"];
        const replies = ["aww :(",
            "aww :cry:",
            "*sniff sniff*  :cry:",
            "Wha- Why?",
            ":cry:",
            "I... I'm sorry",
            "I... I'm sorry :cry:"];

        for (let i = 0; i < fu.length; i++) {
            if (msg.content.toLowerCase().includes(fu[i].toLowerCase())) {
                msg.channel.send(replies[Math.floor(Math.random() * (replies.length - 1))]);
            }
        }
        return true;
    }
}