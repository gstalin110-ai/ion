const AIMessage = require('../models/AIMessage');
const AIPreference = require('../models/AIPreference');

class AIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
  }

  async generateResponse(conversationId, userMessage, userId, context = 'general') {
    try {
      // Get conversation history
      const history = await AIMessage.findByConversation(conversationId, 10);
      
      // Get user preferences
      const preferences = await AIPreference.findByUser(userId);
      
      // Build messages array for API
      const messages = this.buildMessages(history, userMessage, context, preferences);
      
      // Call AI API (placeholder - integrate with OpenAI or similar)
      const aiResponse = await this.callAI(messages);
      
      // Save user message
      await AIMessage.create({
        conversation_id: conversationId,
        role: 'user',
        content: userMessage,
        metadata: { context }
      });
      
      // Save AI response
      const savedResponse = await AIMessage.create({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiResponse,
        metadata: { model: this.model }
      });
      
      return savedResponse;
    } catch (error) {
      throw new Error(`Error generating AI response: ${error.message}`);
    }
  }

  buildMessages(history, userMessage, context, preferences) {
    const messages = [];
    
    // System prompt based on context
    const systemPrompts = {
      general: `Eres ion, el asistente inteligente de sogyTweb. 
                Tu personalidad es ${preferences?.personality || 'profesional y amigable'}.
                Ayuda a los usuarios con cualquier pregunta sobre la plataforma.`,
      marketplace: `Eres ion, especialista en marketplace de sogyTweb.
                    Ayuda a los vendedores a crear mejores publicaciones,
                    mejorar descripciones, sugerir precios y optimizar ventas.`,
      social: `Eres ion, especialista en redes sociales de sogyTweb.
               Ayuda a los usuarios a crear contenido viral, mejorar engagement
               y crecer su audiencia.`,
      automation: `Eres ion, especialista en automatización de sogyTweb.
                   Ayuda a los usuarios a configurar automatizaciones,
                   crear respuestas automáticas y optimizar procesos.`
    };
    
    messages.push({
      role: 'system',
      content: systemPrompts[context] || systemPrompts.general
    });
    
    // Add conversation history
    history.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });
    
    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    });
    
    return messages;
  }

  async callAI(messages) {
    // Placeholder for AI API integration
    // In production, integrate with OpenAI, Anthropic, or similar
    
    if (!this.apiKey) {
      // Mock response for development
      return this.getMockResponse(messages[messages.length - 1].content);
    }
    
    try {
      // Example OpenAI integration (uncomment and configure)
      /*
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          max_tokens: 500,
          temperature: 0.7
        })
      });
      
      const data = await response.json();
      return data.choices[0].message.content;
      */
      
      return this.getMockResponse(messages[messages.length - 1].content);
    } catch (error) {
      console.error('AI API error:', error);
      return 'Lo siento, tuve un problema al procesar tu solicitud. Por favor intenta nuevamente.';
    }
  }

  getMockResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hola') || lowerMessage.includes('buenos')) {
      return '¡Hola! Soy ion, tu asistente inteligente de sogyTweb. ¿En qué puedo ayudarte hoy?';
    }
    
    if (lowerMessage.includes('producto') || lowerMessage.includes('vender')) {
      return 'Para crear un producto efectivo, te recomiendo:\n\n1. Usa títulos claros y descriptivos\n2. Incluye fotos de alta calidad\n3. Escribe descripciones detalladas\n4. Establece un precio competitivo\n5. Responde rápidamente a los clientes\n\n¿Quieres que te ayude a mejorar una publicación específica?';
    }
    
    if (lowerMessage.includes('precio') || lowerMessage.includes('costo')) {
      return 'Para determinar el mejor precio, considera:\n\n1. El precio de productos similares\n2. Tu costo de producción/adquisición\n3. El margen de ganancia deseado\n4. La demanda del mercado\n5. Tu reputación como vendedor\n\n¿Puedes darme más detalles sobre tu producto?';
    }
    
    if (lowerMessage.includes('descripción') || lowerMessage.includes('describir')) {
      return 'Una buena descripción debe incluir:\n\n1. Características principales\n2. Beneficios para el comprador\n3. Especificaciones técnicas\n4. Estado del producto\n5. Términos de venta/envío\n\nPégame el producto y te ayudaré a crear una descripción profesional.';
    }
    
    if (lowerMessage.includes('marketing') || lowerMessage.includes('promocionar')) {
      return 'Para promocionar tus productos:\n\n1. Comparte en redes sociales\n2. Usa hashtags relevantes\n3. Crea contenido visual atractivo\n4. Ofrece descuentos especiales\n5. Pide reseñas a clientes satisfechos\n\n¿Quieres estrategias específicas para tu tipo de producto?';
    }
    
    return 'Entiendo tu consulta. Como soy ion, el asistente de sogyTweb, puedo ayudarte con:\n\n• Creación y optimización de productos\n• Estrategias de marketing\n• Gestión de ventas\n• Automatización de procesos\n• Análisis de datos\n\n¿Sobre qué tema específico necesitas ayuda?';
  }

  async generateProductDescription(productData) {
    const prompt = `Genera una descripción profesional para el siguiente producto:
    
    Título: ${productData.title}
    Categoría: ${productData.category}
    Precio: ${productData.price}
    
    La descripción debe ser atractiva, incluir beneficios y especificaciones, y estar optimizada para ventas.`;
    
    return this.callAI([{ role: 'user', content: prompt }]);
  }

  async generateSocialPost(content, platform = 'general') {
    const prompt = `Genera una publicación social atractiva para ${platform} basada en:
    
    ${content}
    
    La publicación debe ser viral, incluir hashtags relevantes y tener un tono atractivo.`;
    
    return this.callAI([{ role: 'user', content: prompt }]);
  }

  async generateMarketingCopy(productData, goal = 'sales') {
    const prompt = `Genera copy de marketing para ${goal} del producto:
    
    Título: ${productData.title}
    Descripción: ${productData.description}
    Precio: ${productData.price}
    
    El copy debe ser persuasivo y orientado a conversión.`;
    
    return this.callAI([{ role: 'user', content: prompt }]);
  }
}

module.exports = new AIService();
