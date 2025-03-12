import { useState, useRef, useEffect } from "react";
import "./styles.css";

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false); // Controla se o chat está aberto ou fechado
  const [mensagens, setMensagens] = useState([]); // Armazena o histórico da conversa
  const [pergunta, setPergunta] = useState(""); // Armazena a pergunta atual
  const messagesEndRef = useRef(null); // Referência para o final das mensagens

  // Função para rolar automaticamente para o final das mensagens
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Efeito para rolar para o final sempre que novas mensagens forem adicionadas
  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [mensagens, isOpen]);

  const enviarPergunta = async () => {
    if (!pergunta.trim()) return; // Ignora perguntas vazias

    // Adiciona a pergunta do usuário ao histórico
    const novaMensagemUsuario = { sender: "user", content: pergunta };
    setMensagens((prev) => [...prev, novaMensagemUsuario]);

    // Limpa o campo de pergunta
    setPergunta("");

    try {
      // Envia a requisição para o servidor Flask
      const resposta = await fetch("https://chatbot-i33c.vercel.app/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mensagens: [...mensagens, novaMensagemUsuario], // Envia o histórico completo
          documento: "", // O documento já está carregado no servidor
        }),
      });

      if (!resposta.ok) {
        throw new Error("Erro ao enviar a pergunta");
      }

      const dados = await resposta.json();

      // Adiciona a resposta do bot ao histórico
      const novaMensagemBot = { sender: "bot", content: dados.resposta };
      setMensagens((prev) => [...prev, novaMensagemBot]);
    } catch (erro) {
      console.error("Erro:", erro);
      // Adiciona uma mensagem de erro ao histórico
      const mensagemErro = {
        sender: "bot",
        content: "Desculpe, houve um erro ao processar sua pergunta.",
      };
      setMensagens((prev) => [...prev, mensagemErro]);
    }
  };

  return (
    <div className="floating-chat-container">
      {/* Botão para abrir/fechar o chat */}
      <button className="chat-toggle-button" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "✖" : "💬"}
      </button>

      {/* Caixa de conversa */}
      {isOpen && (
        <div className="chat-box">
          {/* Cabeçalho do Chat */}
          <div className="chat-header">
            <div className="chat-title">
              <span>OlimpIA</span>
            </div>
          </div>

          {/* Área de Mensagens */}
          <div className="chat-messages">
            {mensagens.length === 0 ? (
              <div className="empty-messages">
                Nenhuma mensagem ainda. Comece a conversar!
              </div>
            ) : (
              mensagens.map((msg, index) => (
                <div
                  key={index}
                  className={`message-wrapper ${
                    msg.sender === "user" ? "user" : "bot"
                  }`}
                >
                  {/* Avatar */}
                  <div className="avatar">
                    {msg.sender === "user" ? "👤" : "🤖"}
                  </div>

                  {/* Mensagem */}
                  <div className="message">
                    {msg.content}
                    <span className="message-time">
                      {" "}
                      (
                      {new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      )
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />{" "}
            {/* Referência para rolar automaticamente */}
          </div>

          {/* Área de Entrada de Mensagem */}
          <div className="input-area">
            <textarea
              className="message-input"
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault(); // Previne a quebra de linha
                  enviarPergunta(); // Envia a pergunta
                }
              }}
              placeholder="Digite sua pergunta..."
            />

            <button className="send-button" onClick={enviarPergunta}>
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChat;
