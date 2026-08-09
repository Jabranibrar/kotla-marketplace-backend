import React, { useEffect, useRef, useState } from "react";
import { askKotlaAI } from "../api";
import "../styles/kotlaAI.css";

const INITIAL_MESSAGE = {
  role: "assistant",
  text: "Assalam-o-Alaikum 👋 Main KOTLA AI hoon. Aap Kotla mein kisi product, shop ya offer ke baare mein pooch sakte hain.",
};

const QUICK_ACTIONS = [
  {
    icon: "🔎",
    label: "Products",
    prompt: "Mujhe available products dikhayein",
  },
  {
    icon: "🔥",
    label: "Best Deals",
    prompt: "Mujhe best discount wale products dikhayein",
  },
  {
    icon: "🏪",
    label: "Shops",
    prompt: "Kotla mein available shops batao",
  },
];

export default function KotlaAI({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const sendMessage = async (customMessage = null) => {
    const query = (customMessage ?? message).trim();

    if (!query || loading) return;

    setError("");

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: query,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await askKotlaAI(query, user?._id || user?.id || null);

      const data = response?.data || {};

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            data.answer || "Mujhe aapki request ke liye ye results mile hain.",
          products: Array.isArray(data.products) ? data.products : [],
          businesses: Array.isArray(data.businesses) ? data.businesses : [],
        },
      ]);
    } catch (err) {
      console.error("KOTLA AI:", err);

      setError(
        err?.response?.data?.error || "AI service temporarily unavailable."
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, abhi KOTLA AI se connection nahi ho saka. Please dobara try karein.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          className="kotla-ai-launcher"
          onClick={() => setIsOpen(true)}
          aria-label="Open KOTLA AI"
        >
          <span className="kotla-ai-launcher-icon">✦</span>

          <span className="kotla-ai-launcher-text">
            <strong>KOTLA AI</strong>
            <small>Ask anything</small>
          </span>
        </button>
      )}

      {isOpen && (
        <div className="kotla-ai-panel">
          <div className="kotla-ai-panel-header">
            <div className="kotla-ai-brand">
              <div className="kotla-ai-logo">✦</div>

              <div>
                <strong>KOTLA AI</strong>

                <span>
                  <i />
                  Local Shopping Assistant
                </span>
              </div>
            </div>

            <button
              type="button"
              className="kotla-ai-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close KOTLA AI"
            >
              ×
            </button>
          </div>

          <div className="kotla-ai-body">
            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={`kotla-ai-row ${item.role}`}
              >
                {item.role === "assistant" && (
                  <div className="kotla-ai-avatar">✦</div>
                )}

                <div className="kotla-ai-bubble">
                  <div className="kotla-ai-text">{item.text}</div>

                  {item.products?.length > 0 && (
                    <div className="kotla-ai-results">
                      {item.products.map((product) => (
                        <div
                          className="kotla-ai-product"
                          key={product._id || product.id}
                        >
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              loading="lazy"
                            />
                          )}

                          <div className="kotla-ai-product-info">
                            <strong>{product.name}</strong>

                            <div className="kotla-ai-price">
                              Rs{" "}
                              {Number(
                                product.currentPrice || 0
                              ).toLocaleString()}
                            </div>

                            {product.originalPrice > product.currentPrice && (
                              <div className="kotla-ai-old-price">
                                Rs{" "}
                                {Number(product.originalPrice).toLocaleString()}
                              </div>
                            )}

                            {Number(product.discount) > 0 && (
                              <span className="kotla-ai-discount">
                                {product.discount}% OFF
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {item.businesses?.length > 0 && (
                    <div className="kotla-ai-businesses">
                      {item.businesses.map((business) => (
                        <div
                          className="kotla-ai-business"
                          key={business._id || business.id}
                        >
                          <div className="kotla-ai-business-icon">🏪</div>

                          <div>
                            <strong>{business.name}</strong>

                            {business.category && (
                              <span>{business.category}</span>
                            )}

                            {business.address && (
                              <small>📍 {business.address}</small>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="kotla-ai-row assistant">
                <div className="kotla-ai-avatar">✦</div>

                <div className="kotla-ai-bubble kotla-ai-thinking">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="kotla-ai-quick-actions">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => sendMessage(action.prompt)}
                  disabled={loading}
                >
                  <span>{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {error && <div className="kotla-ai-error">{error}</div>}

          <form className="kotla-ai-input-area" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask in English or Roman Urdu..."
              disabled={loading}
            />

            <button
              type="submit"
              disabled={!message.trim() || loading}
              aria-label="Send message"
            >
              ↑
            </button>
          </form>

          <div className="kotla-ai-footer">
            Powered by KOTLA AI • Local marketplace intelligence
          </div>
        </div>
      )}
    </>
  );
}
