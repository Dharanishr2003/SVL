package com.nexorcrm.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;

public class ShiftRequest {

    @NotBlank
    private String name;

    @NotNull
    private LocalTime startTime;

    @NotNull
    private LocalTime endTime;

    private Integer earlyCheckinBufferMinutes = 30;
    private Integer lateCheckinBufferMinutes = 15;
    private Integer breakAllowedMinutes = 15;
    private Integer breakGraceMinutes = 5;
    private Integer lunchAllowedMinutes = 60;
    private Integer lunchGraceMinutes = 10;
    private Boolean isNightShift = false;
    private Integer minWorkMinutes = 480;
    private Integer maxOvertimeMinutes = 120;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public Integer getEarlyCheckinBufferMinutes() { return earlyCheckinBufferMinutes; }
    public void setEarlyCheckinBufferMinutes(Integer earlyCheckinBufferMinutes) { this.earlyCheckinBufferMinutes = earlyCheckinBufferMinutes; }

    public Integer getLateCheckinBufferMinutes() { return lateCheckinBufferMinutes; }
    public void setLateCheckinBufferMinutes(Integer lateCheckinBufferMinutes) { this.lateCheckinBufferMinutes = lateCheckinBufferMinutes; }

    public Integer getBreakAllowedMinutes() { return breakAllowedMinutes; }
    public void setBreakAllowedMinutes(Integer breakAllowedMinutes) { this.breakAllowedMinutes = breakAllowedMinutes; }

    public Integer getBreakGraceMinutes() { return breakGraceMinutes; }
    public void setBreakGraceMinutes(Integer breakGraceMinutes) { this.breakGraceMinutes = breakGraceMinutes; }

    public Integer getLunchAllowedMinutes() { return lunchAllowedMinutes; }
    public void setLunchAllowedMinutes(Integer lunchAllowedMinutes) { this.lunchAllowedMinutes = lunchAllowedMinutes; }

    public Integer getLunchGraceMinutes() { return lunchGraceMinutes; }
    public void setLunchGraceMinutes(Integer lunchGraceMinutes) { this.lunchGraceMinutes = lunchGraceMinutes; }

    public Boolean getIsNightShift() { return isNightShift; }
    public void setIsNightShift(Boolean isNightShift) { this.isNightShift = isNightShift; }

    public Integer getMinWorkMinutes() { return minWorkMinutes; }
    public void setMinWorkMinutes(Integer minWorkMinutes) { this.minWorkMinutes = minWorkMinutes; }

    public Integer getMaxOvertimeMinutes() { return maxOvertimeMinutes; }
    public void setMaxOvertimeMinutes(Integer maxOvertimeMinutes) { this.maxOvertimeMinutes = maxOvertimeMinutes; }
}
