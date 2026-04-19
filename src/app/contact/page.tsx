"use client";

import { useState } from "react";
import {
  Textarea,
  Button,
  Badge,
  Divider,
} from "@mdrbx/nerv-ui";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  function handleSend() {
    const mailto = `mailto:0@jwerba.com?subject=${encodeURIComponent("jwerba.com - new msg")}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-80px)]">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-center gap-3 justify-center">
          <h2 className="font-nerv-display text-2xl md:text-3xl tracking-[0.16em] text-nerv-orange">
            CONTACT
          </h2>
          <Badge label="COMMS" variant="warning" size="sm" />
        </div>

        <p className="font-nerv-mono text-xs text-nerv-mid-gray tracking-wider text-center">
          // DIRECT.CHANNEL
        </p>

        <Divider color="orange" variant="dashed" />

        <div className="border border-nerv-orange/30 p-4 md:p-6 space-y-4">
          <Textarea
            label="MESSAGE"
            color="orange"

            value={body}
            onChange={(e) => setBody(e.target.value)}
          />

          <Button
            variant="primary"
            size="lg"
            onClick={handleSend}
            fullWidth
          >
            SEND.TRANSMISSION
          </Button>

          {sent && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-nerv-mono text-xs text-nerv-green tracking-wider text-center"
            >
              &gt; MAIL.CLIENT.LAUNCHED
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
