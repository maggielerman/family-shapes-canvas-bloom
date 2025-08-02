import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const RecipientTestimonials = () => {
  const testimonials = [
    {
      quote: "Family Shapes helped me find 12 half-siblings I never knew existed. It's changed my life.",
      author: "Sarah M.",
      role: "Donor Conceived Adult"
    },
    {
      quote: "As a parent, I feel so much more confident knowing we can share medical updates with our child's genetic family.",
      author: "David & Lisa K.",
      role: "Parents via Donor Conception"
    },
    {
      quote: "The community aspect is incredible. It's so helpful to connect with other families who understand our journey.",
      author: "Maria R.",
      role: "Single Mother by Choice"
    }
  ];

  return (
    <section className="px-4 sm:px-6 lg:px-12 py-16 sm:py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-light text-navy-800 mb-4">
            Stories from Our Community
          </h2>
          <p className="text-lg text-navy-600 max-w-3xl mx-auto">
            Real families sharing their experiences with Family Shapes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-sage-200">
              <CardContent className="pt-6">
                <blockquote className="text-navy-700 mb-4 italic">
                  "{testimonial.quote}"
                </blockquote>
                <div className="font-semibold text-navy-800">{testimonial.author}</div>
                <div className="text-sm text-navy-600">{testimonial.role}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecipientTestimonials; 