import React, { memo, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FaPen, FaBell, FaCheckCircle, FaHandshake } from "react-icons/fa";

const HowItWorks = memo(function HowItWorks() {
  const shouldReduceMotion = useReducedMotion();

  const steps = useMemo(
    () => [
      {
        id: 1,
        icon: FaPen,
        number: "01",
        title: "Report an Item",
        description:
          "Sign in and submit clear details about the lost or found item, including photos, location, and date.",
      },
      {
        id: 2,
        icon: FaBell,
        number: "02",
        title: "Get Notified",
        description:
          "Receive updates when similar items appear or when someone responds to your report.",
      },
      {
        id: 3,
        icon: FaCheckCircle,
        number: "03",
        title: "Verification",
        description:
          "Ownership is reviewed carefully to help prevent false claims and improve trust.",
      },
      {
        id: 4,
        icon: FaHandshake,
        number: "04",
        title: "Recovery",
        description:
          "Arrange safe collection with the finder or through the campus lost and found office.",
      },
    ],
    []
  );

  const headerMotion = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
      };

  const containerVariants = {
    hidden: {},
    show: {
      transition: shouldReduceMotion
        ? {}
        : {
            staggerChildren: 0.08,
            delayChildren: 0.04,
          },
    },
  };

  const itemVariants = {
    hidden: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 },
    show: shouldReduceMotion
      ? { opacity: 1 }
      : {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          },
        },
  };

  return (
    <section className="bg-base-100 px-4 py-14 md:px-6 md:py-20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="mx-auto mb-12 max-w-3xl text-center md:mb-14"
          viewport={{ once: true, amount: 0.25 }}
          {...headerMotion}
        >
          <span className="badge badge-outline badge-success mb-4 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em]">
            Simple Process
          </span>

          <h2 className="text-3xl font-bold tracking-tight text-base-content md:text-4xl">
            How It Works
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-base-content/70 md:text-base">
            A simple four-step process that helps students and staff report,
            verify, and recover lost belongings more easily.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
        >
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.id}
                variants={itemVariants}
                className="relative h-full"
              >
                <article className="h-full rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-content">
                      {step.number}
                    </div>

                    <span className="text-xs font-medium uppercase tracking-wide text-base-content/40">
                      Step {index + 1}
                    </span>
                  </div>

                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="text-lg" />
                  </div>

                  <h3 className="text-lg font-semibold text-base-content">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-base-content/70">
                    {step.description}
                  </p>
                </article>

                {index < steps.length - 1 && (
                  <div className="pointer-events-none absolute top-1/2 -right-2 hidden -translate-y-1/2 xl:flex">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-base-300 bg-base-100 text-sm text-base-content/30">
                      →
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
});

export default HowItWorks;