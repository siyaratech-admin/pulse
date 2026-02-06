import React, { useEffect, useMemo } from "react"
import { FloatField } from "@/components/form/fields/BasicFields"
import { TableField } from "@/components/form/fields/TableField"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, AlertCircle, CheckCircle } from "lucide-react"
import type { FieldMetadata } from "@/types/form"
import {
  calculateFinalPoints,
  calculateDistributionPoints,
  validateWeightage,
  hasDuplicateUsers
} from "@/utils/energyPointsCalculator"

interface EnergyPointsSectionProps {
  formData: {
    custom_points?: number
    custom_final_points?: number
    custom_points_distribution?: Array<any>
    exp_start_date?: string
    exp_end_date?: string
    completed_on?: string
    status?: string
  }
  onFieldChange: (field: string, value: any) => void
  disabled?: boolean
}

export const EnergyPointsSection: React.FC<EnergyPointsSectionProps> = ({
  formData,
  onFieldChange,
  disabled
}) => {
  // Calculate final points when relevant fields change
  useEffect(() => {
    if (
      formData.custom_points &&
      formData.completed_on &&
      formData.exp_end_date &&
      formData.exp_start_date
    ) {
      const calc = calculateFinalPoints(
        formData.custom_points,
        formData.exp_end_date,
        formData.exp_start_date,
        formData.completed_on
      )
      onFieldChange("custom_final_points", calc.finalPoints)
    } else if (formData.custom_points && !formData.completed_on) {
      // If not completed yet, final points = base points
      onFieldChange("custom_final_points", formData.custom_points)
    }
  }, [formData.custom_points, formData.completed_on, formData.exp_end_date, formData.exp_start_date])

  // Recalculate distribution points when weightage changes
  const handleDistributionChange = (value: Array<any>) => {
    const baseFinalPoints = formData.custom_final_points || formData.custom_points || 0
    const updatedDistribution = value.map((row) => ({
      ...row,
      points: calculateDistributionPoints(row.weightage_ || 0, baseFinalPoints)
    }))
    onFieldChange("custom_points_distribution", updatedDistribution)
  }

  // Recalculate all distribution points when final points change
  useEffect(() => {
    if (formData.custom_final_points && formData.custom_points_distribution?.length) {
      const updatedDistribution = formData.custom_points_distribution.map((row) => ({
        ...row,
        points: calculateDistributionPoints(row.weightage_ || 0, formData.custom_final_points || 0)
      }))
      // Only update if points actually changed
      const hasChanges = updatedDistribution.some(
        (row, idx) => row.points !== formData.custom_points_distribution?.[idx]?.points
      )
      if (hasChanges) {
        onFieldChange("custom_points_distribution", updatedDistribution)
      }
    }
  }, [formData.custom_final_points])

  // Validation checks
  const weightageValidation = useMemo(() => {
    if (formData.status === "Completed" && formData.custom_points_distribution?.length) {
      return validateWeightage(formData.custom_points_distribution)
    }
    if (formData.custom_points_distribution?.length) {
      return validateWeightage(formData.custom_points_distribution)
    }
    return { valid: true, total: 0 }
  }, [formData.custom_points_distribution, formData.status])

  const duplicateCheck = useMemo(() => {
    if (formData.custom_points_distribution?.length) {
      return hasDuplicateUsers(formData.custom_points_distribution)
    }
    return { hasDuplicate: false }
  }, [formData.custom_points_distribution])

  // Define child table fields
  const distributionFields: FieldMetadata[] = [
    {
      fieldname: "user",
      label: "User",
      fieldtype: "Link",
      options: "User",
      reqd: 1,
      in_list_view: 1
    },
    {
      fieldname: "role",
      label: "Role",
      fieldtype: "Link",
      options: "Role",
      in_list_view: 1
    },
    {
      fieldname: "weightage_",
      label: "Weightage (%)",
      fieldtype: "Float",
      reqd: 1,
      precision: 2,
      in_list_view: 1
    },
    {
      fieldname: "points",
      label: "Points",
      fieldtype: "Float",
      read_only: 1,
      precision: 2,
      in_list_view: 1
    }
  ]

  const basePointsField: FieldMetadata = {
    fieldname: "custom_points",
    label: "Base Points",
    fieldtype: "Float",
    description: "Base energy points for this task (before time bonuses/penalties)",
    precision: 2
  }

  const finalPointsField: FieldMetadata = {
    fieldname: "custom_final_points",
    label: "Final Points",
    fieldtype: "Float",
    description: "Points after applying time-based bonuses/penalties",
    read_only: 1,
    precision: 2
  }

  const distributionTableField: FieldMetadata = {
    fieldname: "custom_points_distribution",
    label: "Points Distribution",
    fieldtype: "Table",
    description: "Distribute points among team members by weightage percentage",
    table_fields: distributionFields
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Energy points reward team members for completing tasks. Points are adjusted based on completion timing:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Early completion: +10% bonus per day before deadline</li>
            <li>Late completion: -10% penalty per day after deadline</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Base Points */}
      <div className="space-y-2">
        <FloatField
          field={basePointsField}
          value={formData.custom_points || 0}
          onChange={(value) => onFieldChange("custom_points", value)}
          disabled={disabled}
        />
      </div>

      {/* Final Points (read-only, auto-calculated) */}
      {formData.custom_points ? (
        <div className="space-y-2">
          <FloatField
            field={finalPointsField}
            value={formData.custom_final_points || formData.custom_points || 0}
            onChange={() => { }}
            disabled={true}
          />
          {formData.completed_on && formData.exp_end_date && (
            <p className="text-sm text-muted-foreground">
              {(() => {
                const calc = calculateFinalPoints(
                  formData.custom_points || 0,
                  formData.exp_end_date,
                  formData.exp_start_date || formData.exp_end_date,
                  formData.completed_on
                )
                if (calc.daysDifference === 0) {
                  return "Completed on time"
                } else if (calc.daysDifference > 0) {
                  return `Completed ${calc.daysDifference} day(s) late (${calc.bonusPercentage}% penalty)`
                } else {
                  return `Completed ${Math.abs(calc.daysDifference)} day(s) early (+${calc.bonusPercentage}% bonus)`
                }
              })()}
            </p>
          )}
        </div>
      ) : null}

      {/* Points Distribution Table */}
      {formData.custom_points ? (
        <>
          <div className="space-y-2">
            <TableField
              field={distributionTableField}
              value={formData.custom_points_distribution || []}
              onChange={handleDistributionChange}
              disabled={disabled}
            />
          </div>

          {/* Validation Messages */}
          {duplicateCheck.hasDuplicate && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Duplicate user found: {duplicateCheck.duplicateUser}. Each user can only appear once.
              </AlertDescription>
            </Alert>
          )}

          {!weightageValidation.valid && formData.status === "Completed" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{weightageValidation.message}</AlertDescription>
            </Alert>
          )}

          {weightageValidation.valid &&
            weightageValidation.total === 100 &&
            formData.custom_points_distribution?.length > 0 && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Weightage allocation is valid (100%)
                </AlertDescription>
              </Alert>
            )}

          {formData.custom_points_distribution?.length > 0 &&
            formData.status !== "Completed" &&
            weightageValidation.total !== 100 &&
            weightageValidation.total > 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Current weightage total: {weightageValidation.total}%. Must equal 100% when task is marked as
                  Completed.
                </AlertDescription>
              </Alert>
            )}
        </>
      ) : null}
    </div>
  )
}
