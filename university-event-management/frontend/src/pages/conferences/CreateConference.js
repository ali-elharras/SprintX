import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";

import { conferenceService } from "../../services/conference";
import theme from "../../theme";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Select from "../../components/Select";
import Button from "../../components/Button";
import Navbar from "../../components/Navbar";

const conferenceSchema = yup.object({
  name: yup.string().required("Conference name is required"),
  startDate: yup.date().required("Start date is required"),
  endDate: yup
    .date()
    .required("End date is required")
    .min(yup.ref("startDate"), "End date must be after start date"),
  shortDescription: yup
    .string()
    .required("Short description is required")
    .max(500, "Short description cannot exceed 500 characters"),
  fullAgenda: yup.string().required("Full agenda is required"),
  websiteLink: yup
    .string()
    .required("Website link is required")
    .url("Must be a valid URL"),
  requiredBudget: yup
    .number()
    .required("Required budget is required")
    .min(0, "Budget cannot be negative"),
  fundingSource: yup
    .string()
    .required("Funding source is required")
    .oneOf(["external", "GUC"]),
  extraResources: yup.string(),
});

const CreateConference = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(conferenceSchema),
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await conferenceService.createConference(data);
      toast.success("Conference created successfully");
      navigate("/conferences");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.colors.background.default }}>
      <Navbar />
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: theme.spacing[6] }}>
        <Card>
          <h1 style={{ 
            fontSize: theme.typography.fontSize["2xl"],
            marginBottom: theme.spacing[6],
            color: theme.colors.text.primary 
          }}>
            Create New Conference
          </h1>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ display: "grid", gap: theme.spacing[4] }}>
              <Input
                label="Conference Name"
                {...register("name")}
                error={errors.name?.message}
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: theme.spacing[4] }}>
                <Input
                  label="Start Date"
                  type="datetime-local"
                  {...register("startDate")}
                  error={errors.startDate?.message}
                />
                <Input
                  label="End Date"
                  type="datetime-local"
                  {...register("endDate")}
                  error={errors.endDate?.message}
                />
              </div>

              <Input
                label="Short Description"
                multiline
                rows={3}
                {...register("shortDescription")}
                error={errors.shortDescription?.message}
              />

              <Input
                label="Full Agenda"
                multiline
                rows={5}
                {...register("fullAgenda")}
                error={errors.fullAgenda?.message}
              />

              <Input
                label="Website Link"
                type="url"
                {...register("websiteLink")}
                error={errors.websiteLink?.message}
              />

              <Input
                label="Required Budget"
                type="number"
                {...register("requiredBudget")}
                error={errors.requiredBudget?.message}
              />

              <Select
                label="Funding Source"
                options={[
                  { value: "external", label: "External" },
                  { value: "GUC", label: "GUC" },
                ]}
                {...register("fundingSource")}
                error={errors.fundingSource?.message}
              />

              <Input
                label="Extra Resources (Optional)"
                multiline
                rows={3}
                {...register("extraResources")}
                error={errors.extraResources?.message}
              />

              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                style={{ marginTop: theme.spacing[4] }}
              >
                Create Conference
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateConference;